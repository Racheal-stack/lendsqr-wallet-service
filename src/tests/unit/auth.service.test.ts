import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/auth.service';
import { userRepository } from '../../repositories/user.repository';
import { walletRepository } from '../../repositories/wallet.repository';
import { adjutorService } from '../../services/adjutor.service';
import { BadRequestError, UnauthorizedError, ConflictError, BlacklistedUserError } from '../../utils/errors';
import { createMockUser } from '../mocks';
import db from '../../database/connection';

// Mock dependencies
jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/wallet.repository');
jest.mock('../../services/adjutor.service');
jest.mock('../../database/connection');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    
    // Mock transaction
    (db.transaction as jest.Mock) = jest.fn().mockImplementation(async (callback) => {
      const mockTrx = {};
      return callback(mockTrx);
    });
  });

  describe('register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      phone_number: '+2348012345678',
    };

    it('should successfully register a new user', async () => {
      const mockUser = createMockUser({ email: validUserData.email });
      const mockWallet = { id: 'wallet-id', account_number: '12345678901' };
      
      (userRepository.emailExists as jest.Mock).mockResolvedValue(false);
      (userRepository.phoneExists as jest.Mock).mockResolvedValue(false);
      (adjutorService.checkIdentities as jest.Mock).mockResolvedValue(false);
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (walletRepository.create as jest.Mock).mockResolvedValue(mockWallet);

      const result = await authService.register(validUserData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('account_number');
      expect(result.user.email).toBe(validUserData.email);
      expect(result.account_number).toBe('12345678901');
      expect(userRepository.create).toHaveBeenCalled();
      expect(walletRepository.create).toHaveBeenCalled();
    });

    it('should throw error if required fields are missing', async () => {
      await expect(authService.register({
        email: '',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone_number: '+2348012345678',
      })).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if email already exists', async () => {
      (userRepository.emailExists as jest.Mock).mockResolvedValue(true);

      await expect(authService.register(validUserData)).rejects.toThrow(ConflictError);
      await expect(authService.register(validUserData)).rejects.toThrow('Email already registered');
    });

    it('should throw ConflictError if phone already exists', async () => {
      (userRepository.emailExists as jest.Mock).mockResolvedValue(false);
      (userRepository.phoneExists as jest.Mock).mockResolvedValue(true);

      await expect(authService.register(validUserData)).rejects.toThrow(ConflictError);
      await expect(authService.register(validUserData)).rejects.toThrow('Phone number already registered');
    });

    it('should throw BlacklistedUserError if user is in karma blacklist', async () => {
      (userRepository.emailExists as jest.Mock).mockResolvedValue(false);
      (userRepository.phoneExists as jest.Mock).mockResolvedValue(false);
      (adjutorService.checkIdentities as jest.Mock).mockResolvedValue(true);

      await expect(authService.register(validUserData)).rejects.toThrow(BlacklistedUserError);
    });
  });

  describe('login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      const mockUser = createMockUser({
        email: credentials.email,
        password: hashedPassword,
      });
      const mockWallet = { id: 'wallet-id', account_number: '12345678901', user_id: mockUser.id };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (walletRepository.findByUserId as jest.Mock).mockResolvedValue(mockWallet);

      const result = await authService.login(credentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(credentials.email);
    });

    it('should throw error if email and password are missing', async () => {
      await expect(authService.login({ email: '', password: '' })).rejects.toThrow(BadRequestError);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(credentials)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(credentials)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedError if user is inactive', async () => {
      const mockUser = createMockUser({ is_active: false });
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(credentials)).rejects.toThrow(UnauthorizedError);
      await expect(authService.login(credentials)).rejects.toThrow('Account is deactivated');
    });

    it('should throw BlacklistedUserError if user is blacklisted', async () => {
      const mockUser = createMockUser({ is_blacklisted: true });
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(credentials)).rejects.toThrow(BlacklistedUserError);
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const mockUser = createMockUser({
        password: await bcrypt.hash('differentpassword', 10),
      });
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(credentials)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getUserById', () => {
    it('should return user profile', async () => {
      const mockUser = createMockUser();
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getUserById(mockUser.id);

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await authService.getUserById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should return user for valid token', async () => {
      const mockUser = createMockUser();
      const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        secret,
        { expiresIn: '24h' }
      );

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.verifyToken(token);
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid token', async () => {
      const result = await authService.verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const mockUser = createMockUser();
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        'default-secret-change-in-production',
        { expiresIn: '-1h' }
      );

      const result = await authService.verifyToken(token);
      expect(result).toBeNull();
    });
  });
});
