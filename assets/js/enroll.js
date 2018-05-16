$(document).ready(function() {

    var serverEndpoint = $('#endpoint').val();
    var deviceId;

    var urlEnroll = "http://10.100.4.109:8280/api/device-mgt/v1.0/device/agent/1.0.0/enroll";
    var urlToken = "http://10.100.4.109:8280/token";


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

    var request = webOS.service.request("luna://com.palm.connectionmanager", {
        method: "getStatus",
        onSuccess: function (inResponse) {
            console.log("Internet connection: " + JSON.stringify(inResponse.isInternetConnectionAvailable));
            // To-Do something
            enroll();
        },
        onFailure: function (inError) {
            console.log("Failed to get network state");
            console.log("[" + inError.errorCode + "]: " + inError.errorText);
            // To-Do something
        }
    });

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

        function ajaxSend() {
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
    };

    function refreshAccessToken() {

        var refreshTokenBody = "grant_type=refresh_token&refresh_token=14688303-15ac-32d6-9898-1879a835995d&scope=PRODUCTION";

        ajaxSend();

        function ajaxSend() {
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
    };

});