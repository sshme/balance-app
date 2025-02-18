import {config} from 'dotenv'

config()

export default {
    development: {
        username:   process.env.DB_USER     || "balance_user",
        password:   process.env.DB_PASSWORD || "secure_password",
        database:   process.env.DB_NAME     || "balance_app",
        host:       process.env.DB_HOST     || "localhost",
        port:       process.env.DB_PORT     || 5432,
        dialect:    'postgres',
        logging:    false
    }
};
