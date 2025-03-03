import express from 'express';
import UpdateBalanceUseCase from '../../application/use-cases/UpdateBalanceUseCase.js';
import UserService from '../../domain/services/UserService.js';
import SequelizeUserRepository from '../../infrastructure/persistence/sequelize/SequelizeUserRepository.js';
import {body} from "express-validator";
import UpdateBalanceDTO from "../../application/dto/UpdateBalanceDTO.js";
import validateRequest from "../../../../shared/middleware/validationMiddleware.js";

const router = express.Router();

const userRepository = new SequelizeUserRepository();
const userService = new UserService(userRepository);

const updateBalanceDefaultUseCase = new UpdateBalanceUseCase(userService.updateBalanceDefault.bind(userService));
const updateBalancePessimisticUseCase = new UpdateBalanceUseCase(userService.updateBalancePessimistic.bind(userService));
const updateBalanceOptimisticUseCase = new UpdateBalanceUseCase(userService.updateBalanceOptimistic.bind(userService));

const validateBalanceRequest = [
    body('userId')
        .isInt()
        .custom(value => typeof value === 'number' && value > 0)
        .withMessage('userId must be an integer more than 0'),
    body('amount')
        .isInt()
        .custom(value => typeof value === 'number')
        .withMessage('amount must be an integer'),
    validateRequest
];

router.patch('/balance/default', ...validateBalanceRequest, async (req, res) => {
    const {userId, amount} = req.body;

    try {
        const updateBalanceDTO = new UpdateBalanceDTO(userId, amount);
        const updatedUser = await updateBalanceDefaultUseCase.execute(updateBalanceDTO);
        return res.json({balance: updatedUser.getBalance()});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

router.patch('/balance/pessimistic', ...validateBalanceRequest, async (req, res) => {
    const {userId, amount} = req.body;

    try {
        const updateBalanceDTO = new UpdateBalanceDTO(userId, amount);
        const updatedUser = await updateBalancePessimisticUseCase.execute(updateBalanceDTO);
        return res.json({balance: updatedUser.getBalance()});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

router.patch('/balance/optimistic', ...validateBalanceRequest, async (req, res) => {
    const {userId, amount} = req.body;

    try {
        const updateBalanceDTO = new UpdateBalanceDTO(userId, amount);
        const updatedUser = await updateBalanceOptimisticUseCase.execute(updateBalanceDTO);
        return res.json({balance: updatedUser.getBalance()});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

export default router;
