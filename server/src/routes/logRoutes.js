import { Router } from 'express';
import { listLogs, getSummaryStats } from '../controllers/logController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logQuerySchema } from '../validators/log.schema.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getSummaryStats);
router.get('/', validate(logQuerySchema, 'query'), listLogs);

export default router;
