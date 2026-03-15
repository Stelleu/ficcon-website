import { Router } from 'express';
import { ExhibitorController } from '../controllers/exposantController.js';
const router = Router();

// GET /api/exhibitors
router.get('/', ExhibitorController.listExhibitors);

// POST /api/exhibitors
router.post('/', ExhibitorController.createExhibitor);

export default router;


