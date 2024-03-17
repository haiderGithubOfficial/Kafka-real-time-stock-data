require('dotenv').config();
const WebSocket = require('ws');
const candleProducer = require('../kafka/candleProducer');
const moment = require('moment-timezone');
const _ = require('lodash');

moment.tz.setDefault('Asia/Karachi');



// Buffer to hold data for the current interval
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
                candleProducer(extractedData).catch(console.error);
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

module.exports = connectWebSocket;
