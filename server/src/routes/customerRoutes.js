import express from 'express';
import * as customerController from '../controllers/customerController.js';
import { protect, checkPermission } from '../middleware/auth.js';
import { customerValidator, idValidator } from '../middleware/validator.js';

const router = express.Router();

router.use(protect);

router.get('/', customerController.getAllCustomers);
router.get('/stats', customerController.getCustomerStats);
router.get('/search', customerController.searchCustomers);
router.get('/:id', idValidator, customerController.getCustomerById);
router.post('/', checkPermission('write'), customerValidator, customerController.createCustomer);
router.put('/:id', idValidator, checkPermission('write'), customerController.updateCustomer);
router.delete('/:id', idValidator, checkPermission('delete'), customerController.deleteCustomer);

export default router;
