const { consumer } = require('../../config/kafka');
const _ = require('lodash');
const moment = require('moment');
const Feed = require('../../models/Feed');
const { getCandleInterval } = require('../../utils/helper');
moment.tz.setDefault('Asia/Karachi');


const feedConsumer = async () => {
    await consumer.connect();
    let previousChunkKey = null;
    let dataBuffer = [];
    await consumer.subscribe({ topic: 'feed-topic', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const messageValue = JSON.parse(message.value);
            const timestamp = new Date(messageValue.feed_time * 1000).getTime();
            const chunkKey = getCandleInterval(timestamp, 2).format();
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

                const data = await Feed.bulkCreate(dataBuffer);
                if (data) {
                    console.log('datainserted 2 min ', dataBuffer[0].feed_time);
                }

                dataBuffer = []; // Reset the buffer for the next interval
                previousChunkKey = chunkKey;
            }

            dataBuffer.push(messageValue);
        },
    });
};

module.exports = feedConsumer;
