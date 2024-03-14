require('dotenv').config();
const moment = require('moment-timezone');
const WebSocket = require('ws');
const _ = require('lodash');
require('../../config/database');
moment.tz.setDefault('Asia/Karachi');
const candleProducer = require('../kafka/candleProducer');


let previousChunkKey = null;
let dataBuffer = []; // Buffer to hold data for the current interval
function connectWebSocket() {
    console.log('Start time: ', moment().format('M_D_YYYY-HH_mm'));

    const ws = new WebSocket(process.env.WS_URL, {
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
        }
    });

    ws.on('open', function open() {
        console.log('Connected to WebSocket', '\n');
    });

    ws.on('message', function incoming(data) {
        const readableData = data.toString('utf-8');

        try {
            const jsonData = JSON.parse(readableData);
            if (jsonData.data && jsonData.data.lt !== null) {
                const extractedData = {
                    market: jsonData.data.m,
                    symbol: jsonData.data.s,
                    time: jsonData.data.t,
                    opening: jsonData.data.o,
                    high: jsonData.data.h,
                    low: jsonData.data.l,
                    close: jsonData.data.c,
                    volume: jsonData.data.lt.v
                };


                const timestamp = new Date(extractedData.time * 1000);
                const chunkKey = moment(timestamp).startOf('minute').format();

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
                    candleProducer(filteredCandles).catch(console.error);
                    dataBuffer = []; // Reset the buffer for the next interval
                    previousChunkKey = chunkKey;
                }
                extractedData.candleChunkTime = chunkKey

                dataBuffer.push(extractedData);
            }
        } catch (error) {
            console.log('Failed to parse JSON:', error);
        }
    });

    ws.on('error', (error) => {
        console.log("WebSocket connection error:", error);
        setTimeout(connectWebSocket, 5000);
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket closed. Code: ${code}, Reason: ${reason}`);
        setTimeout(connectWebSocket, 5000);
    });
}

module.exports = connectWebSocket
