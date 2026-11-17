import { ZodError } from 'zod';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        return res.status(400).json({
          success: false,
          error: {
            message: 'Input validation failed',
            code: 'VALIDATION_ERROR',
            details,
            status: 400,
          },
        });
      }
      next(err);
    }
  };
};
