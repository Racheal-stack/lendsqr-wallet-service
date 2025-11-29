import { validate } from '../../validators';
import { mockRequest, mockResponse, mockNext } from '../mocks';
import { BadRequestError } from '../../utils/errors';

describe('Validators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate middleware', () => {
    it('should pass validation with valid data', () => {
      const rules = [
        { field: 'email', required: true, type: 'email' as const },
        { field: 'password', required: true, type: 'string' as const, minLength: 6 },
      ];

      const middleware = validate(rules);
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      middleware(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw BadRequestError for missing required field', () => {
      const rules = [
        { field: 'email', required: true, type: 'email' as const },
      ];

      const middleware = validate(rules);
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      const next = mockNext;

      expect(() => middleware(req as any, res as any, next)).toThrow(BadRequestError);
      expect(() => middleware(req as any, res as any, next)).toThrow('email is required');
    });

    it('should throw BadRequestError for invalid email format', () => {
      const rules = [
        { field: 'email', required: true, type: 'email' as const },
      ];

      const middleware = validate(rules);
      const req = mockRequest({
        body: { email: 'invalid-email' },
      });
      const res = mockResponse();
      const next = mockNext;

      expect(() => middleware(req as any, res as any, next)).toThrow(BadRequestError);
      expect(() => middleware(req as any, res as any, next)).toThrow('email must be a valid email address');
    });

    it('should throw BadRequestError for invalid phone format', () => {
      const rules = [
        { field: 'phone', required: true, type: 'phone' as const },
      ];

      const middleware = validate(rules);
      const req = mockRequest({
        body: { phone: '12345' },
      });
      const res = mockResponse();
      const next = mockNext;

      expect(() => middleware(req as any, res as any, next)).toThrow(BadRequestError);
      expect(() => middleware(req as any, res as any, next)).toThrow('phone must be a valid Nigerian phone number');
    });

    it('should throw BadRequestError for string below minLength', () => {
      const rules = [
        { field: 'password', required: true, type: 'string' as const, minLength: 6 },
      ];

      const middleware = validate(rules);
      const req = mockRequest({
        body: { password: '123' },
      });
      const res = mockResponse();
      const next = mockNext;

      expect(() => middleware(req as any, res as any, next)).toThrow(BadRequestError);
      expect(() => middleware(req as any, res as any, next)).toThrow('password must be at least 6 characters');
    });

    it('should throw BadRequestError for string above maxLength', () => {
      const rules = [
        { field: 'name', required: true, type: 'string' as const, maxLength: 5 },
      ];

      const middleware = validate(rules);
      const req = mockRequest({
        body: { name: 'verylongname' },
      });
      const res = mockResponse();
      const next = mockNext;

      expect(() => middleware(req as any, res as any, next)).toThrow(BadRequestError);
      expect(() => middleware(req as any, res as any, next)).toThrow('name must not exceed 5 characters');
    });

    it('should throw BadRequestError for invalid amount', () => {
      const rules = [
        { field: 'amount', required: true, type: 'amount' as const },
      ];

      const middleware = validate(rules);
      const req = mockRequest({
        body: { amount: -100 },
      });
      const res = mockResponse();
      const next = mockNext;

      expect(() => middleware(req as any, res as any, next)).toThrow(BadRequestError);
    });

    it('should skip validation for optional fields when not provided', () => {
      const rules = [
        { field: 'description', type: 'string' as const },
      ];

      const middleware = validate(rules);
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      const next = mockNext;

      middleware(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
    });

    it('should collect multiple validation errors', () => {
      const rules = [
        { field: 'email', required: true, type: 'email' as const },
        { field: 'password', required: true, type: 'string' as const },
      ];

      const middleware = validate(rules);
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      const next = mockNext;

      expect(() => middleware(req as any, res as any, next)).toThrow(BadRequestError);
      expect(() => middleware(req as any, res as any, next)).toThrow(/email is required.*password is required/);
    });
  });
});
