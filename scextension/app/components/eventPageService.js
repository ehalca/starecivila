angular.module('myApp.services', [])


        .factory('eventPageService', ['$interval', '$log', function ($interval, $log) {
                var connection = false;
                function isConnected() {
                    return connection;
                }
                var servicePort = connect();

                function connect() {
                    var port = chrome.runtime.connect({name: "extension"});
                    port.postMessage({joke: "Knock knock extension"});
                    port.onMessage.addListener(function (msg) {
                        if (msg.question == "Who's there?extension")
                            port.postMessage({answer: "Madame extension"});
                        else if (msg.question == "Madame who?extension")
                            port.postMessage({answer: "Madame... Bovary extension"});
                    });
                    connection = true;
                    port.onDisconnect.addListener(function () {
                        connection = false;
                        servicePort = connect();
                    });
                }
                return {
                    isConnected: isConnected
                }
            }]);