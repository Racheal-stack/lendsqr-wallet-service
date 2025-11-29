import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { successResponse, createdResponse } from '../utils/response';

export class AuthController {
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
}

export const authController = new AuthController();
