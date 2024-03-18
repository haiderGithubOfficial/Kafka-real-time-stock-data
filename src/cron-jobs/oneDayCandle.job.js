require('../config/database');
const _ = require('lodash');
const { Op } = require('sequelize');
const cron = require('node-cron');
const Candle = require('../models/Candle');
const Feed = require('../models/Feed');
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Karachi');

cron.schedule('0 16 * * 1-5', async function () {
    try {
        console.log('Cron Job Executed at:', moment().format('M_D_YYYY-H_m'));
        const targetDate = moment().subtract(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment().format('YYYY-MM-DD HH:mm:ss');

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
        if (data.length === 0) {
            console.log('No data found');
            return;
        }
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
                candleTime: moment(_.head(entries).feed_time).hours(0).minutes(0).seconds(0).milliseconds(0).format('YYYY-MM-DD HH:mm:ss')
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
            candle_type: '1d'
        }))
        try {
            await Candle.bulkCreate(filteredCandles);
            console.log('1 day Candles created successfully');
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.error('Error fetching candles:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Karachi"
});