import { LogEntry } from '../models/LogEntry.js';
import { Item } from '../models/Item.js';

export const getStatsSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const twoDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 23, 59, 59, 999);

    const [expiredCount, useTodayCount, within2DaysCount, okCount, totalInStock] =
      await Promise.all([
        Item.countDocuments({ status: 'in_stock', useByDate: { $lt: todayStart } }),
        Item.countDocuments({
          status: 'in_stock',
          useByDate: { $gte: todayStart, $lte: todayEnd },
        }),
        Item.countDocuments({
          status: 'in_stock',
          useByDate: { $gt: todayEnd, $lte: twoDaysEnd },
        }),
        Item.countDocuments({ status: 'in_stock', useByDate: { $gt: twoDaysEnd } }),
        Item.countDocuments({ status: 'in_stock' }),
      ]);

    res.json({
      success: true,
      data: {
        expired: expiredCount,
        useToday: useTodayCount,
        within2Days: within2DaysCount,
        soon: within2DaysCount,
        ok: okCount,
        inStock: totalInStock,
        total: totalInStock,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listLogs = async (req, res, next) => {
  try {
    const {
      type,
      reason,
      performedBy,
      item,
      search,
      from,
      to,
      fromDate,
      toDate,
      page = 1,
      limit = 30,
    } = req.query;

    const query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (reason && reason !== 'all') {
      query.reason = reason;
    }

    if (performedBy && performedBy !== 'all') {
      query.performedBy = performedBy;
    }

    if (item) {
      query.item = item;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ itemName: regex }, { notes: regex }, { note: regex }, { performedByName: regex }];
    }

    const startDate = from || fromDate;
    const endDate = to || toDate;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await LogEntry.countDocuments(query);

    const logs = await LogEntry.find(query)
      .populate('performedBy', 'name email role')
      .populate('item', 'name category useByDate storageLocation')
      .populate('fridge', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: {
        logs,
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

export const getSummaryStats = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const twoDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 23, 59, 59, 999);

    const [expiredCount, useTodayCount, within2DaysCount, okCount, totalInStock] =
      await Promise.all([
        Item.countDocuments({ status: 'in_stock', useByDate: { $lt: todayStart } }),
        Item.countDocuments({
          status: 'in_stock',
          useByDate: { $gte: todayStart, $lte: todayEnd },
        }),
        Item.countDocuments({
          status: 'in_stock',
          useByDate: { $gt: todayEnd, $lte: twoDaysEnd },
        }),
        Item.countDocuments({ status: 'in_stock', useByDate: { $gt: twoDaysEnd } }),
        Item.countDocuments({ status: 'in_stock' }),
      ]);

    const urgentItems = await Item.find({
      status: 'in_stock',
      useByDate: { $lte: twoDaysEnd },
    })
      .sort({ useByDate: 1 })
      .limit(10)
      .populate('addedBy', 'name')
      .populate('createdBy', 'name');

    const [totalCollections, totalDisposals, totalIntakes] = await Promise.all([
      LogEntry.countDocuments({ type: 'collection' }),
      LogEntry.countDocuments({ type: 'disposal' }),
      LogEntry.countDocuments({ type: 'intake' }),
    ]);

    const disposalReasonsAgg = await LogEntry.aggregate([
      { $match: { type: 'disposal' } },
      { $group: { _id: '$reason', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
    ]);

    const categoryBreakdownAgg = await Item.aggregate([
      { $match: { status: 'in_stock' } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
    ]);

    const recentActivity = await LogEntry.find()
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        urgencySummary: {
          expired: expiredCount,
          useToday: useTodayCount,
          useWithin2Days: within2DaysCount,
          soon: within2DaysCount,
          ok: okCount,
          totalInStock,
          needsAttentionTotal: expiredCount + useTodayCount + within2DaysCount,
        },
        logTotals: {
          intakes: totalIntakes,
          collections: totalCollections,
          disposals: totalDisposals,
        },
        disposalReasonsBreakdown: disposalReasonsAgg.map((r) => ({
          reason: r._id,
          count: r.count,
          totalQuantity: r.totalQuantity,
        })),
        categoryBreakdown: categoryBreakdownAgg.map((c) => ({
          category: c._id,
          count: c.count,
          totalQuantity: c.totalQuantity,
        })),
        urgentItems,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};
