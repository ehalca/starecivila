'use strict';
(function () {
    
    var inject = inject || {};
    
    $(document).ready(function () {
        var port = chrome.runtime.connect({name: "knockknock"});
        port.postMessage({event: {name:'init', data:{mode:0}}});
        port.onMessage.addListener(function (msg) {
            console.log(JSON.stringify(msg));
            if (msg.event.name === "STOP"){
                
            } else if (msg.question == "Madame who?"){
            }
        });
        $("#input2").val("jora");
    });
})();