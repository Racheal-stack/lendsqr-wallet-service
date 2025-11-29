import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  InternalServerError,
  InsufficientFundsError,
  BlacklistedUserError,
} from '../../utils/errors';

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with message and status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new AppError('Test', 400);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('BadRequestError', () => {
    it('should have status code 400', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should use default message', () => {
      const error = new BadRequestError();
      expect(error.message).toBe('Bad request');
    });
  });

  describe('UnauthorizedError', () => {
    it('should have status code 401', () => {
      const error = new UnauthorizedError('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Not authenticated');
    });

    it('should use default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('should have status code 403', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('should use default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should have status code 404', () => {
      const error = new NotFoundError('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should use default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    it('should have status code 409', () => {
      const error = new ConflictError('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already exists');
    });

    it('should use default message', () => {
      const error = new ConflictError();
      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should have status code 422', () => {
      const error = new UnprocessableEntityError('Validation failed');
      expect(error.statusCode).toBe(422);
    });
  });

  describe('InternalServerError', () => {
    it('should have status code 500', () => {
      const error = new InternalServerError('Server crashed');
      expect(error.statusCode).toBe(500);
    });

    it('should use default message', () => {
      const error = new InternalServerError();
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('InsufficientFundsError', () => {
    it('should have status code 400', () => {
      const error = new InsufficientFundsError('Not enough balance');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Not enough balance');
    });

    it('should use default message', () => {
      const error = new InsufficientFundsError();
      expect(error.message).toBe('Insufficient funds');
    });
  });

  describe('BlacklistedUserError', () => {
    it('should have status code 403', () => {
      const error = new BlacklistedUserError();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('User is blacklisted and cannot be onboarded');
    });
  });
});
