/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * This file holds connection information used by the Sequelize CLI
 * when running migrations and seeders to create or update databases
 */
const dotenv = require('dotenv');

dotenv.config();

const development = {
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH,
  logging: false,
  synchronize: false,
};

const production = {
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH,
  logging: false,
  synchronize: false,
};

const test = {
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH,
  logging: false,
  synchronize: false,
};

module.exports = {
  development,
  test,
  production,
};
