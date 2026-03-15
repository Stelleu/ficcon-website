import { Router } from 'express';
import { VisitorController } from '../controllers/visiteurController.js';
const router = Router();

// GET /api/visiteurs
router.get('/', VisitorController.listVisitors);

// POST /api/visiteurs
router.post('/', VisitorController.createVisitor);

export default router;
