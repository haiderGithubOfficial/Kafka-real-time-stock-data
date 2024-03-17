require('../src/config/database')
require('../src/config/kafka')
const webSocketCandleProducer = require('./services/websocket');
const candleConsumer = require('./services/kafka/fiveMinuteCandleConsumer');
const threeCandleConsumer = require('./services/kafka/oneMinuteCandleConsumer');

webSocketCandleProducer();
candleConsumer().catch((err) => console.error(err));
threeCandleConsumer().catch((err) => console.error(err));


