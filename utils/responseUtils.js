/**
 * API response structure formatter
 * Creates a standardized response format for the frontend
 */

// Success response
exports.successResponse = (data, statusCode = 200) => {
  return {
    success: true,
    statusCode,
    data
  };
};

// Error response
exports.errorResponse = (message, statusCode = 500) => {
  return {
    success: false,
    statusCode,
    error: message
  };
};

// Pagination helper
exports.paginationResponse = (data, page, limit, total) => {
  return {
    success: true,
    count: data.length,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      totalCount: total
    },
    data
  };
};