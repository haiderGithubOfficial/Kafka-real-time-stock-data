const { producer } = require('../../config/kafka');

async function candleProducer(extractedData) {
    if (!extractedData) return;
    await producer.send({
        topic: 'stock-topic',
        messages: [
            { value: JSON.stringify(extractedData) }
        ],
    });
}

module.exports = candleProducer;