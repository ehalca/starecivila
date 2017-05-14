angular.module('myApp.services', [])


        .service('eventPageService', ['$interval', '$log', '$q', '$timeout', function ($interval, $log, $q, $timeout) {
                var connection = false;
                function isConnected() {
                    return connection;
                }
                var servicePort = connect();

                function connect() {
                    var port = chrome.runtime.connect({name: "extension"});
                    port.onMessage.addListener(function (msg) {
                        console.log(JSON.stringify(msg));
                    });
                    connection = true;
                    port.onDisconnect.addListener(function () {
                        connection = false;
                        servicePort = connect();
                    });
                    return port;
                }
                function pushData(data, force) {
                    if (servicePort)
                        servicePort.postMessage({event: {force: force, name: 'pushData', data: {data: data}}});
                }
                function pushMode(mode, force) {
                    if (servicePort)
                        servicePort.postMessage({event: {force: force, name: 'pushMode', data: {mode: mode}}});
                }
                function pushMapping(mapping, force) {
                    if (servicePort)
                        servicePort.postMessage({event: {force: force, name: 'pushMessage', data: {mapping: mapping}}});
                }
                function getBackGroundData() {
                    var deferred = $q.defer();
                    var resolved = false;

                    var listener = function (msg) {
                        if (msg.event.name === 'retrieveData') {
                            if (msg.event.data.data) {
                                deferred.resolve(msg.event.data);
                                resolved = true;
                            } else {
                                deferred.reject();
                            }
                        }
                        servicePort.onMessage.removeListener(listener);
                    };
                    $timeout(function () {
                        if (!resolved) {
                            deferred.reject();
                        }
                    }, 10000);
                    servicePort.onMessage.addListener(listener);
                    servicePort.postMessage({event: {name: 'retrieveData'}});
                    return deferred.promise;
                }
                return {
                    isConnected: isConnected,
                    pushData: pushData,
                    pushMode: pushMode,
                    pushMapping: pushMapping,
                    getBackGroundData: getBackGroundData
                }
            }])

        .factory('configService', ['eventPageService', function (eventPageService) {

                var mode = 0;
                function getMode() {
                    return mode;
                }
                function setMode(m, force) {
                    mode = m;
                    eventPageService.pushMode(mode, force);
                }
                return {
                    getMode: getMode,
                    setMode: setMode
                };
            }])
        .factory('dataService', ['configService', 'eventPageService', function (configService, eventPageService) {
                var data;
                function setData(raw) {
                    var reservations = new ReservationData(getMapping(), raw);
                    if (reservations) {
                        data = reservations;
                        eventPageService.pushData(data, true);
                    }
                }
                function getData() {
                    return data;
                }
                function getMapping() {
                    return [new LawyerMapping(), new TestMapping()][configService.getMode()];
                }

                return {
                    setData: setData,
                    getData: getData,
                    getMapping: getMapping
                }
            }]);