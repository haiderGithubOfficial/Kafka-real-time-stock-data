const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'kafka-trading-view',
    brokers: ['192.168.18.140:9092'] // Replace <PRIVATE_IP> with your Kafka broker's IP
});

let producer = null;
let consumer = null;
let consumer2 = null;

async function kafkaConnect() {
    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: 'stock-group' });
    consumer2 = kafka.consumer({ groupId: 'stock-group2' });
    await producer.connect();
    await consumer.connect();
    await consumer2.connect();
}

kafkaConnect();

module.exports = {
    producer,
    consumer,
    consumer2
}