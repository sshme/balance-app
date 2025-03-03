import UserModel from './UserModel.js';
import User from '../../../domain/entities/User.js';
import {Op} from "sequelize";

class SequelizeUserRepository {
    async findById(userId) {
        const userRecord = await UserModel.findByPk(userId);
        if (!userRecord) {
            return null;
        }
        return new User(userRecord.id, userRecord.balance, userRecord.version);
    }

    async updateBalanceDefault(userId, amount) {
        const whereClause = {id: userId};
        if (amount < 0) {
            whereClause.balance = {[Op.gte]: Math.abs(amount)};
        }

        const [_, rows] = await UserModel.update(
            {balance: UserModel.sequelize.literal(`balance + ${amount}`)},
            {where: whereClause, returning: true}
        );

        if (rows.length === 0) {
            throw new Error('User not found or balance update failed');
        }

        const user = rows[0];
        return new User(user.id, user.balance, user.version);
    }

    async updateBalancePessimistic(userId, amount) {
        const transaction = await UserModel.sequelize.transaction();
        try {
            const userRecord = await UserModel.findOne({
                where: {id: userId},
                lock: transaction.LOCK.UPDATE,
                transaction,
            });

            if (!userRecord) {
                throw new Error('User not found');
            }

            const user = new User(userRecord.id, userRecord.balance, userRecord.version);
            user.updateBalance(amount);

            await userRecord.update({balance: user.getBalance()}, {transaction});
            await transaction.commit();

            return user;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateBalanceOptimistic(userId, amount) {
        const transaction = await UserModel.sequelize.transaction();
        try {
            const userRecord = await UserModel.findOne({
                where: {id: userId},
                transaction,
            });

            if (!userRecord) {
                throw new Error('User not found');
            }

            const user = new User(userRecord.id, userRecord.balance, userRecord.version);
            user.updateBalance(amount);

            const [_, updatedUserRecords] = await UserModel.update(
                {balance: user.getBalance(), version: user.getVersion() + 1},
                {where: {id: userId, version: user.getVersion()}, returning: true, transaction}
            );

            if (updatedUserRecords.length === 0) {
                throw new Error('Optimistic lock error');
            }

            await transaction.commit();
            return user;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default SequelizeUserRepository;
