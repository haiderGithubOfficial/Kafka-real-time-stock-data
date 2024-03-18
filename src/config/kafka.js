const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'kafka-trading-view',
    brokers: ['192.168.0.111:9092'] // Replace <PRIVATE_IP> with your Kafka broker's IP
});

let producer = null;
let consumer = null;
async function kafkaConnect() {
    producer = kafka.producer();
    consumer = kafka.consumer({
        groupId: 'feed-group', sessionTimeout: 45000,
        heartbeatInterval: 15000
    });
}

kafkaConnect();

module.exports = {
    producer,
    consumer,
    kafkaConnect
}