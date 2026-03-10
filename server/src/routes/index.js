import express from 'express';
import authRoutes from './authRoutes.js';
import customerRoutes from './customerRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import reportRoutes from './reportRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(ApiResponse.success({ message: 'Enterprise SaaS Dashboard API' }));
});

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

export default router;
