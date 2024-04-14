const Sequelize = require('sequelize');
const sequelize = require('../config/database.js');

const Feed = sequelize.define('Feed', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    market: {
        type: Sequelize.STRING,
        allowNull: false
    },
    symbol: {
        type: Sequelize.STRING,
        allowNull: false
    },
    closing: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    volume: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    feed_time: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    // Additional model options
    timestamps: false,
    tableName: 'feed',
    indexes: [
        {
            unique: true,
            fields: ['market', 'symbol', 'closing', 'volume', 'feed_time']
        }
    ]
});

module.exports = Feed;