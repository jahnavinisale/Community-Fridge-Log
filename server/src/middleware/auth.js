import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required. No token provided.',
          code: 'UNAUTHORIZED',
          status: 401,
        },
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired authentication token',
          code: 'INVALID_TOKEN',
          status: 401,
        },
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User associated with this token no longer exists',
          code: 'USER_NOT_FOUND',
          status: 401,
        },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Account has been deactivated. Please contact an administrator.',
          code: 'ACCOUNT_DEACTIVATED',
          status: 403,
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
