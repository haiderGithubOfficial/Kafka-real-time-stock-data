const cron = require('node-cron');
const { Kafka } = require('kafkajs');
require('dotenv').config();
const _ = require('lodash');
const moment = require('moment');
const Feed = require('../../src/models/Feed');
const { getBufferInterval } = require('../../src/utils/helper');
moment.tz.setDefault('Asia/Karachi');

let kafka = null;
let producer = null;
let consumer = null;

async function connectKafka() {
    try {
        console.log('Cron Job Executed at:', moment().format('M_D_YYYY-H_m'));

        if (!kafka) {
            kafka = new Kafka({
                clientId: 'kafka-trading-view',
                brokers: [`${process.env.KAFKA_PRIVATE_IP}:${process.env.KAFKA_PORT}`]
            });
        }

        if (!producer) {
            producer = kafka.producer();
            await producer.connect({
                maxInFlightRequests: 1,
                idempotent: true
            });
        }

        if (!consumer) {
            consumer = kafka.consumer({
                groupId: 'feed-group',
                sessionTimeout: 45000,
                heartbeatInterval: 15000
            });
            await consumer.connect();
            await consumer.subscribe({ topic: 'feed-topic', fromBeginning: false });
            let previousChunkKey = null;
            let lastTimeInserted = null;
            let dataBuffer = [];

            await consumer.run({
                eachMessage: async ({ message }) => {
                    const messageValue = JSON.parse(message.value);
                    if (messageValue && messageValue.feed_time) {
                        const timestamp = new Date(messageValue.feed_time * 1000).getTime();
                        const chunkKey = getBufferInterval(timestamp, 2).format();
                        messageValue.feed_time = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
                        if (previousChunkKey === null) {
                            previousChunkKey = chunkKey;
                        }

                        if (previousChunkKey !== chunkKey) {
                            const uniqueData = dataBuffer.filter(function (item, index) {
                                return index === dataBuffer.findIndex(function (obj) {
                                    return JSON.stringify(item) === JSON.stringify(obj);
                                })
                            })

                            console.log(`Data :`, dataBuffer.length);
                            console.log(`Unique Data :`, uniqueData.length);

                            const data = await Feed.bulkCreate(uniqueData, { ignoreDuplicates: true });
                            if (data) {
                                lastTimeInserted = moment();
                                console.log('datainserted 2 min ', dataBuffer[0].feed_time);
                            }
                            dataBuffer = []; // Reset the buffer for the next interval
                            previousChunkKey = chunkKey;
                        }
                        dataBuffer.push(messageValue);
                    }
                },
            });
            setInterval(async () => {
                if (lastTimeInserted) {
                    const timeDifferece = moment().diff(lastTimeInserted, 'minutes');
                    const uniqueData = dataBuffer.filter(function (item, index) {
                        return index === dataBuffer.findIndex(function (obj) {
                            return JSON.stringify(item) === JSON.stringify(obj);
                        })
                    })
                    if (timeDifferece > 5 && uniqueData.length > 0) {
                        const data = await Feed.bulkCreate(dataBuffer, { ignoreDuplicates: true });
                        console.log('data inserted of last candle :', dataBuffer.length);
                        dataBuffer = [];
                        lastTimeInserted = moment();
                    }
                }
            }, 600000)
        }
    } catch (error) {
        console.log(error);
    }
}

// 58 8,13 * * 1-5
cron.schedule('58 8,13 * * 1-5', connectKafka, {
    scheduled: true,
    timezone: "Asia/Karachi"
});

const setProducer = (value) => {
    producer = value;
}

const setConsumer = (value) => {
    consumer = value;
}

const setKafka = (value) => {
    kafka = value
}

module.exports = {
    getProducer: () => producer,
    getConsumer: () => consumer,
    getKafka: () => kafka,
    setProducer,
    setConsumer,
    setKafka,
}