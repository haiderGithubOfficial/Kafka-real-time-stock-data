require('../src/config/database')
require('../src/config/kafka')
const webSocketCandleProducer = require('./services/websocket');
const candleConsumer = require('./services/kafka/feedConsumer');

webSocketCandleProducer();
candleConsumer().catch((err) => console.error(err));



