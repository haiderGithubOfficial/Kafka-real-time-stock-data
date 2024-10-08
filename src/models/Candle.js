const Sequelize = require('sequelize');
const sequelize = require('../config/database.js');

const Candle = sequelize.define('Candle', {
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
    opening: {
        type: Sequelize.FLOAT,
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
    min: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    max: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    candletime: {
        type: Sequelize.DATE,
        allowNull: false
    },
    candle_type: {
        type: Sequelize.STRING,
        allowNull: false
    }

}, {
    timestamps: false,
    tableName: 'Candles'
});

module.exports = Candle;