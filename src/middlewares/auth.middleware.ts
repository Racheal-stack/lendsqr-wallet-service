import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';
import { User } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format. Use: Bearer <token>');
    }

    const token = parts[1];
    const user = await authService.verifyToken(token);

    if (!user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    if (user.is_blacklisted) {
      throw new UnauthorizedError('Account is blacklisted');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
