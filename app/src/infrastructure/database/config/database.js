import { config } from 'dotenv';
import { Sequelize } from 'sequelize';

config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'balance_app',
    process.env.DB_USER || 'balance_user',
    process.env.DB_PASSWORD || 'secure_password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

export default sequelize;
