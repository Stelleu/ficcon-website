import { Router } from 'express';
import { DonationController } from '../controllers/donationController.js';

const router = Router();

router.post('/checkout', DonationController.createCheckoutSession);

export default router;