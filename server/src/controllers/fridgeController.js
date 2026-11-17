import { Fridge } from '../models/Fridge.js';

export const getFridgeInfo = async (req, res, next) => {
  try {
    let fridge = await Fridge.findOne({ isDefault: true });
    if (!fridge) {
      fridge = await Fridge.findOne();
    }
    if (!fridge) {
      fridge = await Fridge.create({
        name: 'Main Community Fridge',
        location: 'Community Center Courtyard, 104 High Street',
        capacityLitres: 450,
        temperatureCelsius: 3.5,
        isDefault: true,
      });
    }

    res.json({
      success: true,
      data: fridge,
    });
  } catch (err) {
    next(err);
  }
};

export const updateFridgeInfo = async (req, res, next) => {
  try {
    let fridge = await Fridge.findOne({ isDefault: true }) || await Fridge.findOne();
    if (!fridge) {
      fridge = new Fridge({ isDefault: true });
    }

    const { name, location, capacityLitres, temperatureCelsius, notes } = req.body;
    if (name) fridge.name = name;
    if (location) fridge.location = location;
    if (capacityLitres !== undefined) fridge.capacityLitres = capacityLitres;
    if (temperatureCelsius !== undefined) fridge.temperatureCelsius = temperatureCelsius;
    if (notes !== undefined) fridge.notes = notes;

    await fridge.save();

    res.json({
      success: true,
      message: 'Fridge details updated successfully',
      data: fridge,
    });
  } catch (err) {
    next(err);
  }
};
