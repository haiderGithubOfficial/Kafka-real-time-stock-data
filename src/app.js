const webSocketCandleProducer = require('./services/websocket');
const candleConsumer = require('./services/kafka/candleConsumer');

webSocketCandleProducer();
candleConsumer().catch((err) => console.error(err));


