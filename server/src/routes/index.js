import express from 'express';
import authRoutes from './authRoutes.js';
import customerRoutes from './customerRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import reportRoutes from './reportRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import workspaceRoutes from './workspaceRoutes.js';
import adminRoutes from './adminRoutes.js';
import userRoutes from './userRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import maintenanceGuard from '../middleware/maintenance.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = express.Router();

// Maintenance enforcement runs first: it opens only the routes needed to
// reach the status endpoint, sign in (per-user check) and recover sessions.
router.use(maintenanceGuard);

router.get('/', (req, res) => {
  res.json(ApiResponse.success({ message: 'Enterprise SaaS Dashboard API' }));
});

// Health & readiness probes (public — used by load balancers and Render)
router.get('/health', (req, res) => {
  res.json(ApiResponse.success({ status: 'ok', uptime: process.uptime() }));
});

router.get('/ready', async (req, res) => {
  const checks = { mongo: 'down', redis: 'down' };
  try {
    const mongoose = await import('mongoose');
    checks.mongo = mongoose.default.connection?.readyState === 1 ? 'up' : 'down';
  } catch { /* keep 'down' */ }
  try {
    const { getRedisClient } = await import('../config/redis.js');
    const client = getRedisClient?.();
    checks.redis = client?.isOpen ? 'up' : 'down';
  } catch { /* keep 'down' */ }
  const ready = Object.values(checks).every((s) => s === 'up');
  res.status(ready ? 200 : 503).json({
    statusCode: ready ? 200 : 503,
    message: ready ? 'Ready' : 'Not ready',
    success: ready,
    data: { checks },
  });
});

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/maintenance', maintenanceRoutes);

export default router;
