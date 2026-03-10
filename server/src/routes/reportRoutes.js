import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect, checkPermission } from '../middleware/auth.js';
import { reportValidator, idValidator } from '../middleware/validator.js';

const router = express.Router();

router.use(protect);

router.get('/public', reportController.getPublicReports);
router.get('/', reportController.getAllReports);
router.get('/:id', idValidator, reportController.getReportById);
router.post('/', checkPermission('write'), reportValidator, reportController.createReport);
router.put('/:id', idValidator, checkPermission('write'), reportController.updateReport);
router.delete('/:id', idValidator, checkPermission('delete'), reportController.deleteReport);

export default router;
