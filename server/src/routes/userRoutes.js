import { Router } from 'express';
import { listUsers, createUser, updateUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserRoleSchema } from '../validators/user.schema.js';

const router = Router();

// Volunteer management is restricted to administrators
router.use(authenticate, requireRole('admin'));

router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);
router.patch('/:id', validate(updateUserRoleSchema), updateUser);

export default router;
