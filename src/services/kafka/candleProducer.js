const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'kafka-trading-view',
    brokers: ['192.168.18.140:9092'],
    retry: {
        initialRetryTime: 100,
        retries: 10 // Increase the number of retries
    }
});

const producer = kafka.producer();

// Connect the producer outside of the runProducer to avoid multiple connections
producer.connect();

async function candleProducer(extractedData) {
    if (extractedData.length === 0) return;

    console.log('Sending aggregated data to Kafka', extractedData.length);

    await producer.send({
        topic: 'stock-topic',
        messages: [
            { value: JSON.stringify(extractedData) }
        ],
    });

    console.log('Message sent successfully');
}

module.exports = candleProducer;