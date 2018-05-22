$(document).ready(function() {

    var deviceId;
    var accessToken;

    // This function gets the system time to use UTC as a device ID in emulator
    var request = webOS.service.request("luna://com.palm.systemservice", {
        method: "time/getSystemTime",
        parameters: { "subscribe": false },
        onSuccess: function (inResponse) {
            //console.log("Result: " + JSON.stringify(inResponse.localtime));
            deviceId = JSON.stringify(inResponse.utc);
        },
        onFailure: function (inError) {
            console.log("Failed to get system time information");
            console.log("[" + inError.errorCode + "]: " + inError.errorText);
            // To-Do something
        }
    });

    // This function gets the network state of the TV
    var request = webOS.service.request("luna://com.palm.connectionmanager", {
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

    // This function includes code to generate refresh token
    function refreshAccessToken(urlToken, urlEnroll) {
        var refreshTokenBody = "grant_type=password&username=admin&password=admin&scope=" +
            "perm:device:disenroll perm:device:enroll perm:device:modify perm:device:operations perm:device:publish-event";

        $.ajax({
            type: "POST",
            url: urlToken,
            data: refreshTokenBody,
            headers: {
                'Authorization': 'Basic Mlk3OExJWHBNNkNKeXl3WHdNZnBVVnA3RXlRYTpQOHJ3el9HNWRnZWlfcVlxWUVZanBvaVgxZVlh',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (resp) {
                accessToken = resp.access_token;
                console.log("!!!!!!!!!!  " + accessToken);

                sendPayload(urlEnroll, accessToken);
            },
        });
    };

    // This function includes code to send payload data
    function sendPayload(urlEnroll, accessToken) {
        var data = {
            "name": "webOS TV " + deviceId,
            "type": "webOS",
            "description": "description",
            "deviceIdentifier": deviceId,
            "enrolmentInfo": {"ownership": "BYOD", "status": "ACTIVE"},
            "properties": [{"name": "propertyName", "value": "propertyValue"}]
        };

        $.ajax({
            type: "POST",
            url: urlEnroll,
            data: JSON.stringify(data),
            headers: {
                'Authorization': 'Bearer ' +  accessToken,
                'Content-Type': 'application/json'
            },
            success: function () {
                console.log("success");
            },
        });
    };

    // This functions includes the code for device enrollment with server
    function enroll() {
        $("#next").click(function() {

            var serverEndpoint = $("#server_endpoint").val();

            // server endpoint = 10.100.4.109:8280
            var urlEnroll = serverEndpoint + "/api/device-mgt/v1.0/device/agent/1.0.0/enroll";
            var urlToken = serverEndpoint + "/token";

            refreshAccessToken(urlToken, urlEnroll);

        });
    };

});