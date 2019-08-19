
var db_query = require('../db/executeQuery');
var ticket_query = require('../db/ticketQuery');


function generateTicketByServiceId(serviceId, next) {
    const query = ticket_query.queryGenerateTicket();
    const params = [serviceId];
    db_query.paramQuery(query, params, (err, result) => {
        if (err) return next(err);
        let newTicketNo = generateTicket(result[0]);
        saveTicketDetail(newTicketNo, serviceId, (err, result) => {
        })

        return next(null, newTicketNo);
    })
}

function generateTicket(lastTicket) {
    let digits = lastTicket.TicketNo.substring(lastTicket.ServiceType.length, lastTicket.DigitLength + 1);
    digits = digits.split('');
    let increasedDigits = '';
    let updateDigitsArr = updateDigits(digits);
     for (let updateDigit of updateDigitsArr) {
        increasedDigits += updateDigit;
    }
     return lastTicket.ServiceType + increasedDigits;
}

function saveTicketDetail(newTicket, serviceId, next) {

    const query = ticket_query.querysaveTicketDetail();
    let currentDate = new Date();
    const params = [newTicket, serviceId, currentDate, currentDate, 0, 0, 0, 0, 1, 0, 0, 0, 0];
  db_query.paramQuery(query, params, (err, result) => {
        if (err) return next(err);
        return next(null, result);
    })
}

function updateDigits(digitArr) {
    let count = 0;
    for (let i = digitArr.length - 1; i >= 0; i--) {
        if (digitArr[i] == 9 && count == 0) {
            digitArr[i] = 0;
        } else {
            if (count == 0) {
                digitArr[i] = parseInt(digitArr[i]) + 1;
                count++;
            }
        }
    }
    return digitArr;

}
exports.generateTicketByServiceId = generateTicketByServiceId;