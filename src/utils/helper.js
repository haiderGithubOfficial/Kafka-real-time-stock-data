const moment = require('moment');

function getCandleInterval(timestamp, interval) {
    const time = moment(timestamp);
    const roundedMinutes = interval * Math.floor(time.minutes() / interval);
    return time.startOf('hour').minutes(roundedMinutes);
}

module.exports = {
    getCandleInterval
}