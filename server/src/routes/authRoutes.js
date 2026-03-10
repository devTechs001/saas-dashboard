import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  registerValidator,
  loginValidator,
  idValidator,
} from '../middleware/validator.js';

const router = express.Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);

router.use(protect);

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

router.use(authorize('admin', 'manager'));

router.get('/users', authController.getAllUsers);
router.get('/users/:id', idValidator, authController.getUserById);
router.put('/users/:id', idValidator, authController.updateUser);
router.delete('/users/:id', idValidator, authorize('admin'), authController.deleteUser);

export default router;
