require('dotenv').config();
const WebSocket = require('ws');
const fs = require('fs');
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Karachi');

function connectWebSocket() {
    // const startTime = Date.now();

    // const date = new Date();
    // console.log('Start time: ', date);

    const date = moment().format('M_D_YYYY-HH_mm');
    console.log('Start time: ', date);

    const ws = new WebSocket(process.env.WS_URL, {
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
        }
    });

    ws.on('open', function open() {
        console.log('Connected to WebSocket', '\n');
    });

    ws.on('message', function incoming(data) {
        const date = moment().format('M_D_YYYY-HH');
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
                console.log(extractedData);
            }
        } catch (error) {
            console.log('Failed to parse JSON:', error);
        }
    });

    ws.on('error', (error) => {
        console.log("There was an error with the WebSocket connection:", error);
        setTimeout(connectWebSocket, 5000);
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket closed. Code: ${code}, Reason: ${reason}`);
        setTimeout(connectWebSocket, 5000)
    });
}

connectWebSocket();