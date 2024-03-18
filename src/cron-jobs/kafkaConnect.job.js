const cron = require('node-cron');
const { kafkaConnect, producer, consumer } = require('../config/kafka');

cron.schedule('27 9 * * 1-5', async function () {
    try {
        console.log('Cron Job Executed at:', moment().format('M_D_YYYY-H_m'));
        kafkaConnect();
        await producer.connect();
        await consumer.connect();
    } catch (error) {
        console.log(error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Karachi"
});