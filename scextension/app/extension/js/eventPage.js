(function () {
    chrome.runtime.onConnect.addListener(function (port) {
        
        let listener = function (msg) {
            if (msg.joke == "Knock knock")
                port.postMessage({question: "Who's there?"});
            else if (msg.answer == "Madame")
                port.postMessage({question: "Madame who?"});
            else if (msg.answer == "Madame... Bovary")
                port.postMessage({question: "I don't get it."});
            console.log(msg);
        };
        if (port.name == "extension"){
            listener = function (msg) {
            if (msg.joke == "Knock knock extension")
                port.postMessage({question: "Who's there?extension"});
            else if (msg.answer == "Madame extension")
                port.postMessage({question: "Madame who?extension"});
            else if (msg.answer == "Madame... Bovary extension")
                port.postMessage({question: "I don't get it.extension"});
            console.log(msg);
        };
        }
        port.onMessage.addListener(listener);
    });
})();