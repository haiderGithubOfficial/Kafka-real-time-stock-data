require('../src/config/database');
require('../src/config/kafka');

require('./cron-jobs/oneDayCandle.job');
require('./cron-jobs/oneHourCandle.job');

const webSocketCandleProducer = require('./services/websocket');
const candleConsumer = require('./services/kafka/feedConsumer');

webSocketCandleProducer();
candleConsumer().catch((err) => console.error(err));