import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';

const router = Router();

router.post('/contact', EmailController.sendContactEmail);
router.post('/exposant', EmailController.sendExposantApplication);

export default router;