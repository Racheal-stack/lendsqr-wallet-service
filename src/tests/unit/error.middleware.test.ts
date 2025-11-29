import { errorHandler, notFoundHandler } from '../../middlewares/error.middleware';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';
import { mockRequest, mockResponse, mockNext } from '../mocks';

describe('Error Middleware', () => {
  describe('errorHandler', () => {
    it('should handle AppError with correct status code', () => {
      const error = new BadRequestError('Invalid input');
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(error, req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input',
      });
    });

    it('should handle UnauthorizedError', () => {
      const error = new UnauthorizedError('Not authenticated');
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(error, req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authenticated',
      });
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(error, req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Internal server error',
        })
      );
    });

    it('should handle JWT errors', () => {
      const error = new Error('jwt malformed');
      error.name = 'JsonWebTokenError';
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(error, req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(error, req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
      });
    });

    it('should handle MySQL duplicate entry error', () => {
      const error: any = new Error('Duplicate entry');
      error.code = 'ER_DUP_ENTRY';
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      errorHandler(error, req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate entry. Resource already exists.',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with route information', () => {
      const req = mockRequest({
        method: 'GET',
        path: '/api/v1/nonexistent',
      });
      const res = mockResponse();
      const next = mockNext;

      notFoundHandler(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route GET /api/v1/nonexistent not found',
      });
    });
  });
});
