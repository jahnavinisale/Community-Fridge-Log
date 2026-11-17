import mongoose from 'mongoose';

export const LOG_TYPES = ['collection', 'disposal', 'intake'];

export const DISPOSAL_REASONS = [
  'expired',
  'spoiled',
  'damaged_packaging',
  'contamination_suspected',
  'recalled',
  'other',
];

export const COLLECTION_REASONS = [
  'community_pickup',
  'charity_partner',
  'emergency_relief',
  'community_kitchen',
  'other',
];

const logEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Log entry type is required'],
      enum: {
        values: LOG_TYPES,
        message: 'Invalid log type: {VALUE}',
      },
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    itemName: {
      type: String,
      required: [true, 'Item name snapshot is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'other',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      default: 'items',
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          if (this.type === 'disposal') {
            return DISPOSAL_REASONS.includes(val);
          }
          return true;
        },
        message: (props) =>
          `Invalid disposal reason '${props.value}'. Must be one of: ${DISPOSAL_REASONS.join(', ')}`,
      },
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      // Alias
      type: String,
      trim: true,
      default: function () {
        return this.note || '';
      },
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by user is required'],
    },
    performedByName: {
      type: String,
      trim: true,
      default: 'Volunteer',
    },
    fridge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fridge',
    },
  },
  {
    timestamps: true,
  }
);

logEntrySchema.pre('save', function (next) {
  if (this.note && !this.notes) this.notes = this.note;
  if (this.notes && !this.note) this.note = this.notes;
  next();
});

logEntrySchema.index({ type: 1, createdAt: -1 });
logEntrySchema.index({ item: 1, createdAt: -1 });
logEntrySchema.index({ performedBy: 1 });

export const LogEntry = mongoose.model('LogEntry', logEntrySchema);
