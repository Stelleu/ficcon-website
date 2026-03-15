import { Router } from 'express';
import { MasterclassController } from '../controllers/masterclassController.js';
const router = Router();

// GET /api/masterclasses
router.get('/', MasterclassController.listMasterclasses);

// POST /api/masterclasses/:code/register
router.post('/:code/register', MasterclassController.registerToMasterclass);

export default router;
