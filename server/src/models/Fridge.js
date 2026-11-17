import mongoose from 'mongoose';

const fridgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fridge name is required'],
      trim: true,
      default: 'Main Community Fridge',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      default: 'Community Center Courtyard, 104 High Street',
    },
    capacityLitres: {
      type: Number,
      default: 450,
      min: 0,
    },
    temperatureCelsius: {
      type: Number,
      default: 3.5,
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: 'Open 24/7 for community donation and collection.',
    },
  },
  {
    timestamps: true,
  }
);

fridgeSchema.index({ isDefault: 1 });

export const Fridge = mongoose.model('Fridge', fridgeSchema);
