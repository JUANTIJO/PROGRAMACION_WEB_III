const { Sequelize } = require('sequelize');
const sqliteAdapter = require('./sqljs-adapter');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
  dialectModule: sqliteAdapter
});

module.exports = sequelize;
