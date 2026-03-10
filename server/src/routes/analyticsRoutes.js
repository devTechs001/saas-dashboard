import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/', analyticsController.getAnalyticsByDate);
router.get('/top-pages', analyticsController.getTopPages);
router.get('/devices', analyticsController.getDeviceBreakdown);
router.post('/', analyticsController.createAnalytics);

export default router;
