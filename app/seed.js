import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import config from './config/database.js';

const sequelize = new Sequelize(config.development);

const umzug = new Umzug({
  migrations: {glob: 'seeders/*.js'},
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({sequelize}),
  logger: console,
});

(async () => {
  try {
    await umzug.up();
    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
})();
