import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
} from '../../utils/response';
import { mockResponse } from '../mocks';

describe('Response Utilities', () => {
  describe('successResponse', () => {
    it('should return success response with default status 200', () => {
      const res = mockResponse();
      const data = { id: 1, name: 'Test' };

      successResponse(res as any, 'Success', data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data,
      });
    });

    it('should return success response with custom status code', () => {
      const res = mockResponse();
      const data = { id: 1 };

      successResponse(res as any, 'Created', data, 201);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('errorResponse', () => {
    it('should return error response with default status 400', () => {
      const res = mockResponse();

      errorResponse(res as any, 'Error occurred');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error occurred',
      });
    });

    it('should include errors array when provided', () => {
      const res = mockResponse();
      const errors = ['Field 1 is required', 'Field 2 is invalid'];

      errorResponse(res as any, 'Validation failed', 400, errors);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors,
      });
    });
  });

  describe('paginatedResponse', () => {
    it('should return paginated response with correct structure', () => {
      const res = mockResponse();
      const data = [{ id: 1 }, { id: 2 }];

      paginatedResponse(res as any, 'Items retrieved', data, 1, 10, 25);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Items retrieved',
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it('should calculate totalPages correctly', () => {
      const res = mockResponse();
      const data = [{ id: 1 }];

      paginatedResponse(res as any, 'Items', data, 1, 10, 5);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            totalPages: 1,
          }),
        })
      );
    });
  });

  describe('createdResponse', () => {
    it('should return 201 status code', () => {
      const res = mockResponse();
      const data = { id: 1 };

      createdResponse(res as any, 'Created', data);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('noContentResponse', () => {
    it('should return 204 status with no body', () => {
      const res = mockResponse();

      noContentResponse(res as any);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
