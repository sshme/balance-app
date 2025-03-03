import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from "./infrastructure/database/config/database.js";

const umzug = new Umzug({
  migrations: {glob: './src/infrastructure/database/migrations/*.js'},
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({sequelize}),
  logger: console,
});

(async () => {
  try {
    await umzug.up();
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();
