import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// "Other users' dashboards" — self or admin (authorization in controller).
router.get('/:id/dashboard', adminController.getUserDashboard);

export default router;
