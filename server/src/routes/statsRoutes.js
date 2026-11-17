import { Router } from 'express';
import { getStatsSummary } from '../controllers/logController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getStatsSummary);

export default router;
