$(document).ready(function() {

    var serverEndpoint = $('#endpoint').val();
    var deviceId;

    function networkState() {
        var request = webOS.service.request("luna://com.palm.connectionmanager", {
            method: "getStatus",
            onSuccess: function (inResponse) {
                console.log("Result: " + JSON.stringify(inResponse));
            },
            onFailure: function (inError) {
                console.log("Failed to get network state");
                console.log("[" + inError.errorCode + "]: " + inError.errorText);
                // To-Do something
                return;
            }
        });
    };


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
            ajaxSend();
        });

        var data = {
            "name": "webOS TV",
            "type": "webOS",
            "description": "descritption",
            "deviceIdentifier": deviceId,
            "enrolmentInfo": {"ownership": "BYOD", "status": "ACTIVE"},
            "properties": [{"name": "propertyName", "value": "propertyValue"}]
        };

        var url1 = "http://10.100.4.109:8280/api/device-mgt/v1.0/device/agent/1.0.0/enroll";

        function ajaxSend() {
            $.ajax({
                type: "POST",
                url: url1,
                data: JSON.stringify(data),
                headers: {
                    'Authorization': 'Bearer a2fb9554-82d5-3c96-965f-3725724b7c38',
                    'Content-Type': 'application/json'
                },
                success: function () {
                    console.log("success");
                },
            });
        };
    };

});