import { z } from 'zod';
import { LOG_TYPES } from '../models/LogEntry.js';

export const logQuerySchema = z.object({
  type: z.enum(LOG_TYPES).optional(),
  item: z.string().optional(),
  performedBy: z.string().optional(),
  reason: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
