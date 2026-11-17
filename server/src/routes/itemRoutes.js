import { Router } from 'express';
import {
  listItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  collectItem,
  disposeItem,
} from '../controllers/itemController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createItemSchema,
  updateItemSchema,
  collectItemSchema,
  disposeItemSchema,
} from '../validators/item.schema.js';

const router = Router();

// All item operations require volunteer or admin authentication
router.use(authenticate);

router.get('/', listItems);
router.get('/:id', getItemById);
router.post('/', validate(createItemSchema), createItem);
router.put('/:id', validate(updateItemSchema), updateItem);
router.patch('/:id', validate(updateItemSchema), updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/collect', validate(collectItemSchema), collectItem);
router.post('/:id/dispose', validate(disposeItemSchema), disposeItem);

export default router;
