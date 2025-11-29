import { authenticate } from '../../middlewares/auth.middleware';
import { authService } from '../../services/auth.service';
import { UnauthorizedError } from '../../utils/errors';
import { createMockUser, mockRequest, mockResponse, mockNext } from '../mocks';

jest.mock('../../services/auth.service');

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser = createMockUser();
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();
      const next = mockNext;

      (authService.verifyToken as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(req as any, res as any, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw UnauthorizedError when no authorization header', async () => {
      const req = mockRequest({ headers: {} });
      const res = mockResponse();
      const next = mockNext;

      await authenticate(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError for invalid header format', async () => {
      const req = mockRequest({
        headers: { authorization: 'InvalidFormat token' },
      });
      const res = mockResponse();
      const next = mockNext;

      await authenticate(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError for invalid token', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = mockResponse();
      const next = mockNext;

      (authService.verifyToken as jest.Mock).mockResolvedValue(null);

      await authenticate(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError if user is inactive', async () => {
      const mockUser = createMockUser({ is_active: false });
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();
      const next = mockNext;

      (authService.verifyToken as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError if user is blacklisted', async () => {
      const mockUser = createMockUser({ is_blacklisted: true });
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();
      const next = mockNext;

      (authService.verifyToken as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });
});
