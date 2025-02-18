import express from 'express';
import db from './models/index.js';
import {Op} from "sequelize";

const app = express();
app.use(express.json());

async function initializeDatabase() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection established.');
        await db.sequelize.sync();
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

/**
 * Simplest solution.
 */
app.patch('/approach/self/balance', async (req, res) => {
    const {userId, amount} = req.body;

    if (!userId || typeof amount !== "number") {
        return res.status(400).json({error: 'userId and amount are required'});
    }

    try {
        const [_, rows] = await db.User.update({
            balance: db.sequelize.literal(`balance + ${amount}`)
        }, {
            where: {
                id: userId,
                balance: {
                    [Op.gte]: -amount
                },
            },
            returning: true,
        });

        if (rows.length === 0) {
            return res.status(400).json({error: 'Insufficient funds'});
        }

        const updatedUser = rows[0];

        return res.json({balance: updatedUser.balance});
    } catch (error) {
        console.error('Error updating balance:', error);
        return res.status(500).json({error: 'Internal server error'});
    }
})

/**
 * More complex solution, that uses transactions.
 */
app.patch('/approach/transaction-pessimistic-locking/balance', async (req, res) => {
    const {userId, amount} = req.body;

    if (!userId || amount === undefined) {
        return res.status(400).json({error: 'userId and amount are required'});
    }

    const transaction = await db.sequelize.transaction();

    try {
        const user = await db.User.findOne({
            where: {id: userId},
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({error: 'User not found'});
        }

        user.balance += amount;
        if (user.balance < 0) {
            await transaction.rollback();
            return res.status(400).json({error: 'Insufficient funds'});
        }

        await user.save({transaction});
        await transaction.commit();

        return res.json({balance: user.balance});
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating balance:', error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

const PORT = process.env.PORT || 3000;
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
