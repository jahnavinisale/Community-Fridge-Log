import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['volunteer', 'admin']).default('volunteer'),
  phone: z.string().trim().optional().default(''),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['volunteer', 'admin']).optional(),
  isActive: z.boolean().optional(),
});
