import { DataTypes } from 'sequelize';
import sequelize from '../../../../../infrastructure/database/config/database.js';

const UserModel = sequelize.define('User', {
    balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'users',
    version: true,
});

export default UserModel;