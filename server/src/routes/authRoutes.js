import { Router } from 'express';
import { login, getProfile } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/auth.schema.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Only login and token inspection - no public registration
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getProfile);

export default router;
