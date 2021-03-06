$(document).ready(function() {

    var deviceId;
    var firmwareVersion;
    var model;

    // This function gets the system time to use UTC as a device ID in emulator
    var requestTime = webOS.service.request("luna://com.palm.systemservice", {
        method: "time/getSystemTime",
        parameters: { "subscribe": false },
        onSuccess: function (inResponse) {
            deviceId = JSON.stringify(inResponse.utc);
        },
        onFailure: function (inError) {
            console.log("Failed to get system time information");
            console.log("[" + inError.errorCode + "]: " + inError.errorText);
            // To-Do something
        }
    });

    // This function gets the network state of the TV
    var requestConnectionState = webOS.service.request("luna://com.palm.connectionmanager", {
        method: "getStatus",
        onSuccess: function (inResponse) {
            console.log("Internet connection: " + JSON.stringify(inResponse.isInternetConnectionAvailable));
            enroll();
        },
        onFailure: function (inError) {
            console.log("Failed to get network state");
            console.log("[" + inError.errorCode + "]: " + inError.errorText);

        }
    });

    // This function gets properties of the device
    var requestDetails = webOS.service.request("luna://com.webos.service.tv.systemproperty", {
        method: "getSystemInfo",
        parameters: {
            "keys": ["modelName", "firmwareVersion", "UHD", "sdkVersion"]
        },
        onComplete: function (inResponse) {
            var isSucceeded = inResponse.returnValue;

            if (isSucceeded){
                console.log("Result: " + JSON.stringify(inResponse));
                // To-Do something
                firmwareVersion = inResponse.firmwareVersion;
                model = inResponse.modelName;
            } else {
                console.log("Failed to get TV device information");

                $("#message-board").text("Failed to get TV device information");
            }
        }
    });


    // This function includes code to retrieve client key and secret
    function getClientKeyAndSecret(serverEndpoint, username, password) {
        var data = { "applicationName":"WebOSApp", "tags":["device_management"]};

        var userCredentials = username + ":" + password;
        var userCredentialsBase64 = btoa(userCredentials);

        $.ajax({
            type: "POST",
            url: serverEndpoint + "/api-application-registration/register",
            data: JSON.stringify(data),
            headers: {
                'Authorization': 'Basic ' + userCredentialsBase64,
                'Content-Type': 'application/json'
            },
            success: function (resp) {
                var obj = JSON.parse(resp);

                retrieveAccessToken(serverEndpoint, username, password, obj["client_id"], obj["client_secret"]);
            },
            error: function () {
                $("#message-board").text("Failed to get client ID and secret");
            }
        });
    };


    // This function includes code to generate refresh token
    function retrieveAccessToken(serverEndpoint, username, password, clientKey, clientSecret) {
        var data = "grant_type=password&username=" + username + "&password=" + password + "&scope=" +
            "perm:device:disenroll perm:device:enroll perm:device:modify perm:device:operations perm:device:publish-event";

        var clientKeyAndSecret = clientKey + ":" + clientSecret;
        var clientKeyAndSecretBase64 = btoa(clientKeyAndSecret);

        $.ajax({
            type: "POST",
            url: serverEndpoint + "/token",
            data: data,
            headers: {
                'Authorization': 'Basic ' + clientKeyAndSecretBase64,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (resp) {
                sendDetailsPayload(serverEndpoint, resp.access_token);
            },
            error: function () {
                $("#message-board").text("Failed to retrieve access token");
            }
        });
    };

    // This function includes code to send payload data
    function sendDetailsPayload(serverEndpoint, accessToken) {
        var data = {
            "name": "webOS TV " + deviceId,
            "type": "webOS",
            "description": "description",
            "deviceIdentifier": deviceId,
            "enrolmentInfo": {"ownership": "BYOD", "status": "ACTIVE"},
            "properties": [{"name": "firmware", "value": firmwareVersion},
                {"name": "model", "value": model}
            ]
        };

        $.ajax({
            type: "POST",
            url: serverEndpoint + "/api/device-mgt/v1.0/device/agent/1.0.0/enroll",
            data: JSON.stringify(data),
            headers: {
                'Authorization': 'Bearer ' +  accessToken,
                'Content-Type': 'application/json'
            },
            success: function (data, textStatus, xhr) {
                console.log("success " + xhr.status);

                $("#message-board").text("Enrollment Successful");
            },
            error: function (xhr) {
                console.log("fail " + xhr.status);

                if (xhr.status = 400) {
                    $("#message-board").text("Enrollment already exists");
                } else {
                    $("#message-board").text("Failed to enroll device");
                }
            }
        });
    };

    // This functions includes the code for device enrollment with server
    function enroll() {
        $("#next").click(function() {
            var serverEndpoint = $("#server_endpoint").val();

            // server endpoint = 10.100.4.109:8280
            var urlEnroll = serverEndpoint + "/api/device-mgt/v1.0/device/agent/1.0.0/enroll";
            var urlToken = serverEndpoint + "/token";

            $("#finish").click(function() {
                var username = $("#username").val();
                var password = $("#password").val();

                getClientKeyAndSecret(serverEndpoint,username,password);
            });
        });
    };

});