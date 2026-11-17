export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
      code: 'ROUTE_NOT_FOUND',
      status: 404,
    },
  });
};
