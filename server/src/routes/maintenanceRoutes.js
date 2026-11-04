import express from 'express';
import * as maintenanceController from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public status (clients render banners / block forms from this).
router.get('/', maintenanceController.getStatus);
router.get('/levels', maintenanceController.getLevels);

// Admin control surface.
router.put('/', protect, authorize('admin'), maintenanceController.setMaintenanceMode);

export default router;
