/* eslint-disable no-console */
import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log('Error: DATABASE_URL environment variable not set');
  process.exit(1);
}

if (databaseUrl.indexOf('localhost') === -1) {
  console.log('Error: cannot run reset.ts on non-localhost db');
  process.exit(1);
}
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  schema: 'public',
});
console.log('Resetting database...', databaseUrl);
Promise.resolve(sequelize.query('DROP SCHEMA public CASCADE;')).then(() => {
  Promise.resolve(sequelize.query('CREATE SCHEMA public;')).then(() => {
    Promise.resolve(sequelize.close()).then(() => {
      console.log('Database reset complete');
      process.exit(0);
    });
  });
});
