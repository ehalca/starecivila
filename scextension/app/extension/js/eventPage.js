(function () {

    var background = background || {};
    background.mode = undefined;
    background.mapping = undefined;
    background.data = undefined;
    background.lastReservation = undefined;

    function setMode(event) {
        if (background.mode === undefined || event.force) {
            background.mode = event.data.mode;
            pushEnd();
        }
        background.extensionPort.postMessage({event: {name: 'modeUpdated', data: {mode: background.mode}}});
    }
    function setMapping(event) {
        if (background.mapping === undefined || event.force) {
            background.mapping = event.data.mapping;
            pushEnd();
        }
        background.extensionPort.postMessage({event: {name: 'mappingUpdated', data: {mode: background.mapping}}});
    }
    function setData(event) {
        if (background.data === undefined || event.force) {
            background.data = event.data.data;
            pushEnd();
            background.data = event.data.data;
            var nextIndex = 0;

            background.dataIterator = {
                next: function () {
                    return nextIndex < background.data.reservations.length ?
                            {value: background.data.reservations[nextIndex++], done: false} :
                            {done: true};
                }
            };
            console.log("Data updated!");
            background.extensionPort.postMessage({event: {name: 'dataUpdated', data: {mode: background.data}}});
            pushNextReservation();
        }
    }

    function reservationDone(data) {
        background.lastReservation = undefined;
        let r = background.data.reduce((s, e) => {
            return e.id === data.reservation.id ? e : null
        }, null);
        if (r !== null) {
            r.result = data.resultData;
        }
        pushNextReservation();
    }

    function propagateExtensionMessage(msg) {
        console.log("Message pushed:" + JSON.stringify(msg));
        pushInjectMessage(msg);
    }

    function propagateInjectMessage(msg) {
        console.log("Message pushed:" + JSON.stringify(msg));
        background.extensionPort.postMessage(msg);
    }

    function pushNextReservation() {
        let reservation = background.lastReservation || background.dataIterator.next();
        if (!reservation.done) {
            background.lastReservation = reservation;
            pushInjectMessage(getReservationMessage(reservation));
        } else {
            pushEnd();
        }
    }

    function pushEnd() {
        pushInjectMessage({event: {name: 'STOP'}});
    }
    
    function pushInjectMessage(msg){
        if (background.injectPort){
            background.injectPort.postMessage(msg);
        }
    }
    
    function pushDataToExtension(){
        background.extensionPort.postMessage({event:{name:"retrieveData", data:{data:background.data, mapping:background.mapping, mode:background.mode}}});
    }

    function getReservationMessage(reservation) {
        return {event: {name: 'reservation', data: {reservation: reservation, mapping: background.mapping}}};
    }

    chrome.runtime.onConnect.addListener(function (port) {
        let injectListener = function (msg) {
            if (msg.event.name === "init") {
                if (msg.event.data.mode !== background.mode) {
                    pushEnd();
                } else {
                    pushNextReservation();
                }
            } else if (msg.event.name === "reservationDone") {
                reservationDone(msg.event.data);
                propagateInjectMessage(msg);
            }
        };
        let extensionListener = function (msg) {
            if (msg.event.name === "pushMode") {
                setMode(msg.event);
            } else if (msg.event.name === "pushMapping") {
                setMapping(msg.event);
            } else if (msg.event.name === "pushData") {
                setData(msg.event);
            } else if (msg.event.name === "retrieveData"){
                pushDataToExtension();
            }
        };
        if (port.name === 'extension') {
            background.extensionPort = port;
            background.extensionPort.onMessage.addListener(extensionListener);
        } else if (port.name === 'inject') {
            background.injectPort = port;
            background.injectPort.onMessage.addListener(injectListener);
        }
    });
})();