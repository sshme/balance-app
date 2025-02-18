import { Sequelize } from 'sequelize';
import config from '../config/database.js';

import defineUser from './user.model.js';

const sequelize = new Sequelize(config.development);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = defineUser(sequelize);

export default db;
