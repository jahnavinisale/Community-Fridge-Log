import mongoose from 'mongoose';
import { computeUseByStatus, getDaysRemaining } from '../utils/dateStatus.js';

export const ITEM_CATEGORIES = [
  'dairy',
  'produce',
  'bakery',
  'cooked meal',
  'packaged',
  'drinks',
  'other',
  // Aliases for compatibility
  'prepared_meals',
  'pantry',
  'beverages',
  'meat_fish',
];

export const ITEM_UNITS = [
  'items',
  'kg',
  'g',
  'litres',
  'ml',
  'packs',
  'boxes',
  'cans',
  'loaves',
  'bunches',
  'portions',
  'tins',
];

export const STORAGE_LOCATIONS = ['fridge', 'freezer', 'pantry'];

export const ITEM_STATUSES = ['in_stock', 'collected', 'disposed'];

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ITEM_CATEGORIES,
        message: 'Invalid category: {VALUE}',
      },
      lowercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      default: 'items',
      trim: true,
    },
    donatedBy: {
      type: String,
      trim: true,
      default: 'Anonymous Donor',
    },
    donorName: {
      // Alias
      type: String,
      trim: true,
      default: function () {
        return this.donatedBy || 'Anonymous Donor';
      },
    },
    dateReceived: {
      type: Date,
      default: Date.now,
    },
    donatedDate: {
      // Alias
      type: Date,
      default: function () {
        return this.dateReceived || Date.now();
      },
    },
    useByDate: {
      type: Date,
      required: [true, 'Use-by date is required'],
    },
    storageNote: {
      type: String,
      trim: true,
      default: '',
    },
    storageLocation: {
      type: String,
      enum: STORAGE_LOCATIONS,
      default: 'fridge',
    },
    allergensNote: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ITEM_STATUSES,
        message: 'Invalid status: {VALUE}',
      },
      default: 'in_stock',
    },
    fridge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fridge',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      // Alias
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Synchronize aliases before saving
itemSchema.pre('save', function (next) {
  if (this.donatedBy && !this.donorName) this.donorName = this.donatedBy;
  if (this.donorName && !this.donatedBy) this.donatedBy = this.donorName;
  if (this.dateReceived && !this.donatedDate) this.donatedDate = this.dateReceived;
  if (this.donatedDate && !this.dateReceived) this.dateReceived = this.donatedDate;
  if (this.addedBy && !this.createdBy) this.createdBy = this.addedBy;
  if (this.createdBy && !this.addedBy) this.addedBy = this.createdBy;
  next();
});

// Virtual for calculating use-by urgency status
itemSchema.virtual('useByStatus').get(function () {
  return computeUseByStatus(this.useByDate);
});

// Virtual for remaining days
itemSchema.virtual('daysRemaining').get(function () {
  return getDaysRemaining(this.useByDate);
});

// Explicit indexes for fast query filtering on inventory and dashboard
itemSchema.index({ useByDate: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ status: 1, useByDate: 1 });
itemSchema.index({ category: 1 });

export const Item = mongoose.model('Item', itemSchema);
