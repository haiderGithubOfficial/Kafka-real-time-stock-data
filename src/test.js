require('../src/config/database')
const Feed = require('./models/Feed');
const { Op, fn, literal } = require('sequelize');

const moment = require('moment');

moment.tz.setDefault('Asia/Karachi');

const _ = require('lodash');
const Candle = require('./models/Candle');


// Define an async function to perform the query
async function fetchCandles() {
    try {
        // Assuming 'candletime' is stored in UTC and you're querying based on a specific time zone
        const targetDate = new Date('2024-03-18T12:21:00+05:00');
        const endDate = new Date(targetDate.getTime() + 60000); // Adds 60 seconds to create a 1-minute range

        const data = await Feed.findAll({
            raw: true,
            where: {
                feed_time: {
                    [Op.gte]: targetDate, // Greater than or equal to the target start time
                    [Op.lt]: endDate // But less than the end time (exclusive)
                }
            },
            order: [['feed_time', 'ASC']]
        });
        const candles = [];
        const groupedData = _.groupBy(data, 'symbol');

        _.mapValues(groupedData, (entries) => {
            candles.push({
                market: _.head(entries).market,
                symbol: _.head(entries).symbol,
                opening: _.head(entries).closing,
                closing: _.last(entries).closing,
                max: _.maxBy(entries, 'closing').closing,
                min: _.minBy(entries, 'closing').closing,
                volume: _.sumBy(entries, 'volume'),
                candleTime: moment(_.head(entries).feed_time).seconds(0).milliseconds(0).format('YYYY-MM-DD HH:mm:ss')
            })
        });

        const filteredCandles = candles.map((data) => ({
            market: data.market,
            symbol: data.symbol,
            opening: data.opening,
            closing: data.closing,
            volume: data.volume,
            min: data.min,
            max: data.max,
            candletime: data.candleTime,
            candle_type: '1m'
        }))
        try {
            await Candle.bulkCreate(filteredCandles);
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.error('Error fetching candles:', error);
    }
}



fetchCandles();