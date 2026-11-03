import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.post('/users', adminController.inviteUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/audit-logs', adminController.listAuditLogs);

export default router;
