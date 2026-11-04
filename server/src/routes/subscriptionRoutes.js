import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Plans are public (pricing pages render them signed-out).
router.get('/plans', subscriptionController.getPlans);

router.use(protect);
router.get('/current', subscriptionController.getCurrent);
router.post('/', subscriptionController.subscribe);
router.put('/current', subscriptionController.updateSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);
router.get('/invoices', subscriptionController.getInvoices);

export default router;
