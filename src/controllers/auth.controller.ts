import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { adjutorService } from '../services/adjutor.service';
import { successResponse, createdResponse } from '../utils/response';

export class AuthController {
  private userRepository = userRepository;

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, first_name, last_name, phone_number } = req.body;
      
      const result = await authService.register({
        email,
        password,
        first_name,
        last_name,
        phone_number,
      });

      createdResponse(res, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login({ email, password });

      successResponse(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await authService.getUserById(userId);

      successResponse(res, 'Profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async getBlacklistedUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userRepository.findBlacklisted();
      successResponse(res, 'Blacklisted users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async getNonBlacklistedUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userRepository.findNonBlacklisted();
      successResponse(res, 'Non-blacklisted users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async getBlacklistStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.userRepository.getBlacklistStats();
      successResponse(res, 'Blacklist statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  async checkKarma(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identity = req.body?.identity;
      
      if (!identity) {
        return next(new Error('Identity is required in request body'));
      }
      
      const isBlacklisted = await adjutorService.isBlacklisted(identity);
      successResponse(res, 'Karma check completed', { 
        identity, 
        isBlacklisted,
        status: isBlacklisted ? 'BLACKLISTED' : 'CLEAN'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
