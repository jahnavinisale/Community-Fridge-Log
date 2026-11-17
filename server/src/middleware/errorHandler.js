export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: `Resource not found or invalid format for identifier: ${err.value}`,
        code: 'INVALID_IDENTIFIER',
        status: 400,
      },
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return res.status(409).json({
      success: false,
      error: {
        message: `Duplicate field value entered: ${fields.join(', ')} already exists`,
        code: 'DUPLICATE_RESOURCE',
        details: fields.map((f) => ({ field: f, message: `${f} must be unique` })),
        status: 409,
      },
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database validation failed',
        code: 'DATABASE_VALIDATION_ERROR',
        details,
        status: 400,
      },
    });
  }

  // Explicit status from custom error
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  const code = err.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');

  res.status(status).json({
    success: false,
    error: {
      message,
      code,
      status,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};
