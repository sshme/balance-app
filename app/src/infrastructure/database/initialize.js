import sequelize from './config/database.js';

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        await sequelize.sync();
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

export default initializeDatabase;