const { producer } = require('../../config/kafka');

async function feedProducer(extractedData) {
    await producer.connect({
        maxInFlightRequests: 1,
        idempotent: true
    });
    if (!extractedData) return;
    await producer.send({
        topic: 'feed-topic',
        partition: 0,
        key: 'feed',
        messages: [
            { value: JSON.stringify(extractedData) }
        ],
    });
}

module.exports = feedProducer;