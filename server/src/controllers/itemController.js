import { Item } from '../models/Item.js';
import { LogEntry } from '../models/LogEntry.js';
import { Fridge } from '../models/Fridge.js';

export const listItems = async (req, res, next) => {
  try {
    const {
      status = 'in_stock',
      category,
      storageLocation,
      useByStatus,
      expiringWithinDays,
      search,
      sortBy = 'useByDate',
      order = 'asc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category.toLowerCase().trim();
    }

    if (storageLocation && storageLocation !== 'all') {
      query.storageLocation = storageLocation;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { donorName: regex },
        { donatedBy: regex },
        { notes: regex },
        { storageNote: regex },
      ];
    }

    // Date calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const twoDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 23, 59, 59, 999);

    if (expiringWithinDays !== undefined && expiringWithinDays !== '') {
      const days = parseInt(expiringWithinDays, 10);
      const targetEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 23, 59, 59, 999);
      query.useByDate = { $lte: targetEnd };
    } else if (useByStatus && useByStatus !== 'all') {
      if (useByStatus === 'expired') {
        query.useByDate = { $lt: todayStart };
      } else if (useByStatus === 'use_today') {
        query.useByDate = { $gte: todayStart, $lte: todayEnd };
      } else if (useByStatus === 'soon' || useByStatus === 'use_within_2_days') {
        query.useByDate = { $gt: todayEnd, $lte: twoDaysEnd };
      } else if (useByStatus === 'ok') {
        query.useByDate = { $gt: twoDaysEnd };
      }
    }

    const sortDirection = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortDirection;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Item.countDocuments(query);

    const items = await Item.find(query)
      .populate('addedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('fridge', 'name location')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('addedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('fridge', 'name location');

    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found with the provided ID',
          code: 'ITEM_NOT_FOUND',
          status: 404,
        },
      });
    }

    const logs = await LogEntry.find({ item: item._id })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        item,
        logs,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      useByDate,
      dateReceived,
      donatedDate,
      donatedBy,
      donorName,
      storageNote,
      storageLocation,
      allergensNote,
      notes,
      fridgeId,
    } = req.body;

    let targetFridgeId = fridgeId;
    if (!targetFridgeId) {
      const defaultFridge = (await Fridge.findOne({ isDefault: true })) || (await Fridge.findOne());
      if (defaultFridge) {
        targetFridgeId = defaultFridge._id;
      }
    }

    const donor = donatedBy || donorName || 'Community Donor';
    const received = dateReceived || donatedDate || new Date();

    const item = await Item.create({
      name,
      category: category.toLowerCase().trim(),
      quantity,
      unit: unit || 'items',
      useByDate: new Date(useByDate),
      dateReceived: new Date(received),
      donatedDate: new Date(received),
      donatedBy: donor,
      donorName: donor,
      storageNote: storageNote || '',
      storageLocation: storageLocation || 'fridge',
      allergensNote: allergensNote || '',
      notes: notes || '',
      fridge: targetFridgeId,
      addedBy: req.user._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      status: 'in_stock',
    });

    // Create intake log entry
    await LogEntry.create({
      type: 'intake',
      item: item._id,
      itemName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      note: `Donation received from ${donor}. ${notes || ''}`.trim(),
      notes: `Donation received from ${donor}. ${notes || ''}`.trim(),
      performedBy: req.user._id,
      performedByName: req.user.name,
      fridge: targetFridgeId,
    });

    const populated = await Item.findById(item._id)
      .populate('addedBy', 'name email')
      .populate('fridge', 'name location');

    res.status(201).json({
      success: true,
      message: 'Item added to inventory successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found to update',
          code: 'ITEM_NOT_FOUND',
          status: 404,
        },
      });
    }

    const updates = { ...req.body };
    if (updates.useByDate) updates.useByDate = new Date(updates.useByDate);
    if (updates.dateReceived) updates.dateReceived = new Date(updates.dateReceived);
    if (updates.donatedDate) updates.donatedDate = new Date(updates.donatedDate);
    if (updates.category) updates.category = updates.category.toLowerCase().trim();
    updates.updatedBy = req.user._id;

    const updatedItem = await Item.findByIdAndUpdate(item._id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('addedBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('fridge', 'name location');

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found to delete',
          code: 'ITEM_NOT_FOUND',
          status: 404,
        },
      });
    }

    await Item.findByIdAndDelete(item._id);

    res.json({
      success: true,
      message: `Item '${item.name}' deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const collectItem = async (req, res, next) => {
  try {
    const { quantity, reason = 'community_pickup', note = '', notes = '' } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found for collection',
          code: 'ITEM_NOT_FOUND',
          status: 404,
        },
      });
    }

    if (item.status !== 'in_stock') {
      return res.status(400).json({
        success: false,
        error: {
          message: `Cannot collect item because its current status is '${item.status}'`,
          code: 'ITEM_NOT_IN_STOCK',
          status: 400,
        },
      });
    }

    if (quantity > item.quantity) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Cannot collect ${quantity} ${item.unit}. Only ${item.quantity} ${item.unit} available in stock.`,
          code: 'INSUFFICIENT_QUANTITY',
          status: 400,
        },
      });
    }

    const remaining = item.quantity - quantity;
    item.quantity = remaining;
    if (remaining === 0) {
      item.status = 'collected';
    }
    item.updatedBy = req.user._id;
    await item.save();

    const logNote = note || notes || '';
    const log = await LogEntry.create({
      type: 'collection',
      item: item._id,
      itemName: item.name,
      category: item.category,
      quantity,
      unit: item.unit,
      reason,
      note: logNote,
      notes: logNote,
      performedBy: req.user._id,
      performedByName: req.user.name,
      fridge: item.fridge,
    });

    res.json({
      success: true,
      message: `Successfully collected ${quantity} ${item.unit} of ${item.name}`,
      data: {
        item,
        log,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const disposeItem = async (req, res, next) => {
  try {
    const { quantity, reason, note = '', notes = '' } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found for disposal',
          code: 'ITEM_NOT_FOUND',
          status: 404,
        },
      });
    }

    if (item.status !== 'in_stock') {
      return res.status(400).json({
        success: false,
        error: {
          message: `Cannot dispose item because its current status is '${item.status}'`,
          code: 'ITEM_NOT_IN_STOCK',
          status: 400,
        },
      });
    }

    if (quantity > item.quantity) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Cannot dispose ${quantity} ${item.unit}. Only ${item.quantity} ${item.unit} available in stock.`,
          code: 'INSUFFICIENT_QUANTITY',
          status: 400,
        },
      });
    }

    const remaining = item.quantity - quantity;
    item.quantity = remaining;
    if (remaining === 0) {
      item.status = 'disposed';
    }
    item.updatedBy = req.user._id;
    await item.save();

    const logNote = note || notes || '';
    const log = await LogEntry.create({
      type: 'disposal',
      item: item._id,
      itemName: item.name,
      category: item.category,
      quantity,
      unit: item.unit,
      reason,
      note: logNote,
      notes: logNote,
      performedBy: req.user._id,
      performedByName: req.user.name,
      fridge: item.fridge,
    });

    res.json({
      success: true,
      message: `Successfully logged disposal of ${quantity} ${item.unit} of ${item.name} (${reason})`,
      data: {
        item,
        log,
      },
    });
  } catch (err) {
    next(err);
  }
};
