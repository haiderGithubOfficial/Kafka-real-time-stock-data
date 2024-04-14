require('dotenv').config();
const Sequelize = require('sequelize');

const CONFIG = {
    host: process.env.DB_HOST_PG,
    dialect: 'postgres',
    port: Number(process.env.DB_PORT_PG),
    logging: false,
    pool: {
        max: 50,
        min: 0,
        acquire: 50000,
        idle: 10000,
    },
};
console.log(process.env.DB_USER_PG);
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER_PG, process.env.DB_PASS_PG, CONFIG);

sequelize
    .authenticate()
    .then(() => {
        console.log('sql connected');
    })
    .catch((err) => {
        console.log('Error on conn' + err);
    });

sequelize.sync().then(() => {
    console.log('db sync');
}).catch((error) => {
    console.error('Unable to sync:', error);
});

setInterval(() => {
    console.log('running', new Date().toISOString());
}, 3600000)

module.exports = sequelize;


