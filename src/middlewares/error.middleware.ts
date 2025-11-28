import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import config from '../config';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  stack?: string;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: string[] | undefined;

  // Handle operational errors (AppError instances)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle MySQL errors
  if ((err as any).code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry. Resource already exists.';
  }

  if ((err as any).code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced resource does not exist';
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  // Include stack trace in development
  if (config.env === 'development') {
    errorResponse.stack = err.stack;
    console.error('Error:', err);
  }

  return res.status(statusCode).json(errorResponse);
};

// Handle 404 not found
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
