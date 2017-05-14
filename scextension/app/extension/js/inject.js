'use strict';
(function () {

    var inject = inject || {};
    inject.formSelector = '';
    inject.testFormSelector = '#recaptcha-demo-form';
    inject.modeMapping = {};
    inject.modeMapping[1] = {form: inject.testFormSelector, getResultData: getTestFormResultData};
    inject.modeMapping[0] = {form: inject.formSelector, getResultData: getLawyerResultData};
    $(document).ready(function () {
        inject.port = chrome.runtime.connect({name: "inject"});
        inject.port.onMessage.addListener(function (msg) {
            console.log(JSON.stringify(msg));
            if (msg.event.name === "STOP") {
                console.log("Done. Thank you.");
            } else if (msg.event.name === "reservation") {
                fillForm(msg.event.data);
            }
        });
        if (getPageMode() !== -1 || getResultData()) {
            initInjector();
        } else {
            pushPageNotFound();
        }
    });
    function initInjector() {
        var $form = getFrom();
        if (!checkResultData()) {
            inject.port.postMessage({event: {name: 'init', data: {mode: getPageMode()}}});
        }
    }

    function getResultData() {
        var result = Object.keys(inject.modeMapping).reduce((s,k)=>{
            if (s !== null ) return s;
            return inject.modeMapping[k].getResultData.apply();
        }, null);
        return result;
    }

    function getTestFormResultData() {
        var result = false;
        var confirmation = "OK";
        if ($('.recaptcha-success').length > 0) {
            result = true;
        } else {
            return null;
        }
        return {result: result, confirmation: {text:confirmation}};
    }

    function trySubmitResult() {
        var resultInterval = setInterval(checkSubmit, 500);
        function checkSubmit() {
            var result = checkResultData();
            if (result) {
                clearInterval(resultInterval);
            }
        }
    }

    function checkResultData() {
        var result = getResultData();
        if (result) {
            inject.port.postMessage({event: {name: 'reservationDone', data: {result: result}}});
        }
        return result;
    }

    function getLawyerResultData() {
        return null;// {result: false, confirmation: {}};
    }

    function pushPageNotFound() {
        inject.port.postMessage({event: {name: 'notFound', data: {}}});
    }

    function getPageMode() {
        return Number(Object.keys(inject.modeMapping).reduce((s, k) => {
            if (s > -1)
                return s;
            return $(inject.modeMapping[k].form).length > 0 ? k : s;
        }, -1));
    }

    function getFrom() {
        let mode = getPageMode();
        if (mode >= 0) {
            return $(inject.modeMapping[mode].form);
        }
        return $(inject.testFormSelector);
    }

    function setupForm($form, reservation) {
        $form[0].addEventListener('submit', function (evt) {
            console.log('formSubmitted');
            inject.port.postMessage({event: {name: 'reservationSubmitted', data: {reservation: reservation}}});
            trySubmitResult();
        });
    }



    function fillForm(data) {
        let $form = getFrom();
        setupForm($form, data.reservation.value);
        Object.keys(data.reservation.value.reservationMapping.mapping).forEach((k) => {
            $(data.reservation.value.reservationMapping.mapping[k].selector, $form).val(data.reservation.value.data[k]);
        });
    }

})();