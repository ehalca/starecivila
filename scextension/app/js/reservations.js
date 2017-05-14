'use strict';

class ReservationMapping {
    constructor(mapping) {
        this.mapping = mapping;
    }
    getSelectorMapping() {
        return Object.keys(this.mapping).reduce((s, k) => {
            s[k] = this.mapping[k]['selector'];
            return s;
        }, {});
    }
    getDisplayMapping() {
        return Object.keys(this.mapping).reduce((s, k) => {
            s[k] = this.mapping[k]['displayName'];
            return s;
        }, {});
    }
    toMessage() {
        return this;
    }
    static fromMessage(msg) {
        return new ReservationMapping(msg.mapping);
    }
}

class LawyerMapping extends ReservationMapping {
    constructor() {
        super({
            name: {selector: '#name', displayName: 'Nume Titular'},
            lawyerName: {selector: '#lawerName', displayName: 'Nume Avocat'},
            cnp: {selector: '#cnp', displayName: 'CNP'},
            docs: {selector: '#docs', displayName: 'Numar documente'},
            email: {selector: '#email', displayName: 'Email'},
            phone: {selector: '#phone', displayName: 'Telefon'},
            date: {selector: '#date', displayName: 'Data Programarii'}
        });
    }
}

class TestMapping extends ReservationMapping{
    constructor() {
        super({
            name: {selector: '#input1', displayName: 'Name'},
            lastName: {selector: '#input2', displayName: 'Last Name'},
            email: {selector: '#input3', displayName: 'Email'},
            color: {selector: '#docs', displayName: 'Color'},
        });
    }
}

class Reservation {
    constructor(reservationMapping, data) {
        this.reservationMapping = reservationMapping;
        let mapping = this.reservationMapping.getDisplayMapping();
        this.data = Object.keys(mapping).reduce((s, e) => {
            s[e] = data[mapping[e]];
            return s;
        }, {});
        this.data.id = this.constructor.name + " # " + Math.random().toString(36).substr(2, 10);
    }
    toMessage() {
        return this;
    }
    static fromMessage(msg) {
        var mapping = ReservationMapping.fromMessage(msg.reservationMapping);
        var result = new Reservation(mapping, []);
        result.data = msg.data;
        result.result = msg.result;
        return result;
    }
}
class ReservationData {
    constructor(mapping, data) {
        this.mapping = mapping;
        if (data) {
            this.processData(data);
        }
    }
    processData(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [];

        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length === headers.length) {

                var tarr = {};
                for (var j = 0; j < headers.length; j++) {
                    tarr[headers[j]] = data[j];
                }
                lines.push(new Reservation(this.mapping, tarr));
            }
        }
        this.reservations = lines;
    }
    toMessage() {
        return this.data.map((e) => {
            return e.toMessage();
        });
    }
    static fromMessage(msg) {
        var mapping = ReservationMapping.fromMessage(msg.mapping);
        var reservations = msg.reservations.map((r) => {
            return Reservation.fromMessage(r);
        });
        var result = new ReservationData(mapping, null);
        result.reservations = reservations;
        return result;
    }
}
