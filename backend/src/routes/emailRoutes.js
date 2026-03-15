import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';
const router = Router();

router.post('/send', EmailController.sendEmail);

export default router;