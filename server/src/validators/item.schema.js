import { z } from 'zod';
import { ITEM_CATEGORIES, ITEM_UNITS, STORAGE_LOCATIONS } from '../models/Item.js';
import { DISPOSAL_REASONS, COLLECTION_REASONS } from '../models/LogEntry.js';

export const createItemSchema = z.object({
  name: z.string().trim().min(2, 'Item name must be at least 2 characters').max(120),
  category: z.string().trim().toLowerCase().refine((val) => ITEM_CATEGORIES.includes(val), {
    message: `Category must be one of: ${ITEM_CATEGORIES.join(', ')}`,
  }),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit: z.string().trim().optional().default('items'),
  useByDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid use-by date is required',
  }),
  dateReceived: z.string().optional(),
  donatedDate: z.string().optional(),
  donatedBy: z.string().trim().max(100).optional().default('Anonymous Donor'),
  donorName: z.string().trim().max(100).optional(),
  storageLocation: z.enum(STORAGE_LOCATIONS).optional().default('fridge'),
  storageNote: z.string().trim().max(300).optional().default(''),
  allergensNote: z.string().trim().max(300).optional().default(''),
  notes: z.string().trim().max(500).optional().default(''),
  fridgeId: z.string().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const collectItemSchema = z.object({
  quantity: z.coerce.number().positive('Quantity to collect must be greater than 0'),
  reason: z.string().trim().optional().default('community_pickup'),
  note: z.string().trim().max(500).optional().default(''),
  notes: z.string().trim().max(500).optional().default(''),
});

export const disposeItemSchema = z
  .object({
    quantity: z.coerce.number().positive('Quantity to dispose must be greater than 0'),
    reason: z.enum(DISPOSAL_REASONS, {
      errorMap: () => ({
        message: `Disposal reason must be one of: ${DISPOSAL_REASONS.join(', ')}`,
      }),
    }),
    note: z.string().trim().max(500).optional().default(''),
    notes: z.string().trim().max(500).optional().default(''),
  })
  .superRefine((data, ctx) => {
    const text = data.note || data.notes || '';
    if (data.reason === 'other' && text.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: 'A note (at least 3 characters) is required when disposal reason is "other"',
      });
    }
  });
