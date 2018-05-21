$(document).ready(function() {

    var serverEndpoint = $('#endpoint').val();
    var deviceId;

    // server endpoint = 10.100.4.109:8280
    var urlEnroll = "http://" + serverEndpoint + "/api/device-mgt/v1.0/device/agent/1.0.0/enroll";
    var urlToken = "http://" + serverEndpoint + "/token";

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
    function refreshAccessToken() {
        var refreshTokenBody = "grant_type=refresh_token&refresh_token=14688303-15ac-32d6-9898-1879a835995d&scope=PRODUCTION";

        $.ajax({
            type: "POST",
            url: urlToken,
            data: refreshTokenBody,
            headers: {
                'Authorization': 'Basic RmxNVzMyZ2VubzlncE1velNYd1IyaDVmTzhnYTpoT0RmVDNWQTV3R0pDamRmNzAyMlEwcmZ2Zmth',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (resp) {
                console.log(resp);
            },
        });
    };

    // This functions includes the code for device enrollment with server
    function enroll() {
        $("#next").click(function() {
            refreshAccessToken();
        });

        var data = {
            "name": "webOS TV",
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
                'Authorization': 'Bearer 21bbc9e3-c12a-3ec6-ab59-6fa579649329',
                'Content-Type': 'application/json'
            },
            success: function () {
                console.log("success");
            },
        });
    };

});