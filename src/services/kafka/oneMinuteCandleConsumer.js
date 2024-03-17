const { consumer2 } = require('../../config/kafka');
const _ = require('lodash');
const moment = require('moment');
const candle = require('../../models/Candle');
const { getCandleInterval } = require('../../utils/helper');
moment.tz.setDefault('Asia/Karachi');


const oneMinuteCandleConsumer = async () => {
    let previousChunkKey = null;
    let dataBuffer = [];
    await consumer2.subscribe({ topic: 'stock-topic', fromBeginning: false });

    await consumer2.run({
        eachMessage: async ({ topic, partition, message }) => {
            const messageValue = JSON.parse(message.value);
            const timestamp = new Date(messageValue.time * 1000);
            const chunkKey = getCandleInterval(timestamp, 1).format();

            if (previousChunkKey === null) {
                previousChunkKey = chunkKey;
            }

            if (previousChunkKey !== chunkKey) {
                const uniqueData = dataBuffer.filter(function (item, index) {
                    return index === dataBuffer.findIndex(function (obj) {
                        return JSON.stringify(item) === JSON.stringify(obj);
                    })
                })

                console.log(`Data in file :`, dataBuffer.length);
                console.log(`Unique Data in file :`, uniqueData.length);
                console.log("Fnished Reading file:");

                const candles = [];
                const groupedData = _.groupBy(uniqueData, 'symbol');

                _.mapValues(groupedData, (entries) => {
                    candles.push({
                        market: _.head(entries).market,
                        symbol: _.head(entries).symbol,
                        opening: _.head(entries).close,
                        closing: _.last(entries).close,
                        max: _.maxBy(entries, 'close').close,
                        min: _.minBy(entries, 'close').close,
                        volume: _.sumBy(entries, 'volume'),
                        candleTime: _.head(entries).candleChunkTime
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
                    candletime: data.candleTime
                }))

                const data = candle.bulkCreate(filteredCandles);
                if (data) {
                    console.log('datainserted one minute candle ', filteredCandles[0].candletime);
                }

                dataBuffer = []; // Reset the buffer for the next interval
                previousChunkKey = chunkKey;
            }
            messageValue.candleChunkTime = chunkKey

            dataBuffer.push(messageValue);
        },
    });
};

module.exports = oneMinuteCandleConsumer;
