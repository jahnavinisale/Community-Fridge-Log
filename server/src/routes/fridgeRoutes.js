import { Router } from 'express';
import { getFridgeInfo, updateFridgeInfo } from '../controllers/fridgeController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(authenticate);

router.get('/', getFridgeInfo);
router.patch('/', requireRole('admin'), updateFridgeInfo);

export default router;
