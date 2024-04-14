require('../src/config/database');
require('dotenv').config();
const WebSocket = require('ws');
const moment = require('moment-timezone');
require('./cron-jobs/kafkaConnect.job');
require('./cron-jobs/KafkaDisconnect.job')
require('./cron-jobs/oneDayCandle.job');
require('./cron-jobs/oneHourCandle.job');
const { getProducer } = require('./cron-jobs/kafkaConnect.job')


moment.tz.setDefault('Asia/Karachi');

let ws;
let attempt = 0;

function connectWebSocket() {
    console.log('Start time: ', moment().format('M_D_YYYY-HH_mm'));
    ws = new WebSocket(process.env.WS_URL, {
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
        }
    });

    ws.on("open", () => {
        console.log("Connected to the server");
        attempt = 0; // Reset attempt counter on successful connection
    });

    ws.on('message', async (data) => {
        const readableData = data.toString('utf-8');
        try {
            const jsonData = JSON.parse(readableData);
            if (jsonData.data && jsonData.data.lt !== null) {
                const extractedData = {
                    market: jsonData.data.m,
                    symbol: jsonData.data.s,
                    feed_time: jsonData.data.t,
                    closing: jsonData.data.c,
                    volume: jsonData.data.lt.v
                };
                const producer = getProducer();
                if (producer) {
                    await producer.send({
                        topic: 'feed-topic',
                        partition: 0,
                        key: 'feed',
                        messages: [
                            { value: JSON.stringify(extractedData) }
                        ],
                    });
                }
            }
        } catch (error) {
            console.log('Failed to parse JSON:', error);
        }
    });

    ws.on("close", () => {
        console.log("Disconnected from the server");
        attempt++;
        console.log("atempt: ", attempt);
        const reconnectDelay = Math.min(10000, 500 * 2 ** attempt); // Calculate delay, cap at 10 seconds
        setTimeout(connectWebSocket, reconnectDelay);
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
        ws.close(); // Ensures the 'close' event handler is called
    });
}

connectWebSocket();