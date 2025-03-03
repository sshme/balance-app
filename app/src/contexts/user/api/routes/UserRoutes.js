import { Router } from 'express';
import userController from '../controllers/UserController.js';

const router = Router();

router.use('/users', userController);

export default router;
