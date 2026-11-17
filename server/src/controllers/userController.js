import { User } from '../models/User.js';

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'volunteer', phone = '' } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'An account with this email address already exists',
          code: 'EMAIL_ALREADY_EXISTS',
          status: 409,
        },
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone,
    });

    res.status(201).json({
      success: true,
      message: `User ${user.name} created successfully as ${user.role}`,
      data: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          status: 404,
        },
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You cannot deactivate your own administrative account',
          code: 'SELF_DEACTIVATION_PREVENTED',
          status: 400,
        },
      });
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User account updated successfully',
      data: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};
