const moment = require('moment');

function getBufferInterval(timestamp, interval) {
    const time = moment(timestamp);
    const roundedMinutes = interval * Math.floor(time.minutes() / interval);
    return time.startOf('hour').minutes(roundedMinutes);
}

module.exports = {
    getBufferInterval
}