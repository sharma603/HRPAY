/**
 * Standardized API Response Helper
 * Provides consistent response format for all API endpoints
 */

// Success Response Helper
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

// Error Response Helper
export const errorResponse = (res, error = 'Internal Server Error', code = 'INTERNAL_ERROR', statusCode = 500) => {
  const response = {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

// Validation Error Response
export const validationError = (res, errors, message = 'Validation failed') => {
  return errorResponse(res, message, 'VALIDATION_ERROR', 400);
};

// Not Found Response
export const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 'NOT_FOUND', 404);
};

// Unauthorized Response
export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 'UNAUTHORIZED', 401);
};

// Forbidden Response
export const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 'FORBIDDEN', 403);
};

// Bad Request Response
export const badRequestResponse = (res, message = 'Bad request') => {
  return errorResponse(res, message, 'BAD_REQUEST', 400);
};

// Created Response
export const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

// No Content Response
export const noContentResponse = (res) => {
  return res.status(204).send();
}; 