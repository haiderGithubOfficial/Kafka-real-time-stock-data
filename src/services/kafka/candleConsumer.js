const { Kafka } = require('kafkajs');
const candle = require('../../models/Candle');

const kafka = new Kafka({
    clientId: 'kafka-trading-view',
    brokers: ['192.168.18.140:9092'] // Replace <PRIVATE_IP> with your Kafka broker's IP
});

const consumer = kafka.consumer({ groupId: 'stock-group' });

const candleConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'stock-topic', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const messageValue = message.value.toString();
            const data = candle.bulkCreate(JSON.parse(messageValue));
            if (data) {
                console.log('datainserted');
            }
            console.log(`Received message: ${messageValue}`);
        },
    });
};

module.exports = candleConsumer;
