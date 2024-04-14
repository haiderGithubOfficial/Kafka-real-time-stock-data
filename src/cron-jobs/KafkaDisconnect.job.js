const { setKafka, setProducer, setConsumer, getProducer, getConsumer, getKafka } = require('./kafkaConnect.job');
const cron = require('node-cron');
const moment = require('moment'); // Assuming you're using moment.js

async function disconnectKafka() {
    try {
        console.log('Disconnecting Kafka at:', moment().format('M_D_YYYY-H_m'));
        const producer = getProducer();
        if (producer) {
            await producer.disconnect();
            setProducer(null);
            console.log('Kafka Producer disconnected successfully.');
        }
        const consumer = getConsumer();
        if (consumer) {
            await consumer.disconnect();
            setConsumer(null);
            console.log('Kafka Consumer disconnected successfully.');
        }

        const kafka = getKafka();
        if (kafka) {
            setKafka(null);
        }
        // Assuming you want to reset kafka as well
    } catch (error) {
        console.error('Error disconnecting Kafka:', error);
    }
}

// Schedule to disconnect Kafka every day at 23:55
cron.schedule('50 13,14 * * 1-5', disconnectKafka, {
    scheduled: true,
    timezone: "Asia/Karachi"
});
