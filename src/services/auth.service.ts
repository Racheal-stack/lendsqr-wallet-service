import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import { userRepository } from '../repositories/user.repository';
import { walletRepository } from '../repositories/wallet.repository';
import { adjutorService } from './adjutor.service';
import { 
  User, 
  CreateUserDTO, 
  UserResponse, 
  LoginDTO, 
  AuthResponse 
} from '../models/user.model';
import { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError, 
  BlacklistedUserError 
} from '../utils/errors';
import db from '../database/connection';

const SALT_ROUNDS = 10;

export class AuthService {
  
  async register(userData: CreateUserDTO): Promise<AuthResponse> {
    const { email, password, first_name, last_name, phone_number } = userData;

    if (!email || !password || !first_name || !last_name || !phone_number) {
      throw new BadRequestError('All fields are required');
    }

    const existingEmail = await userRepository.emailExists(email.toLowerCase());
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    const existingPhone = await userRepository.phoneExists(phone_number);
    if (existingPhone) {
      throw new ConflictError('Phone number already registered');
    }

    const isBlacklisted = await adjutorService.checkIdentities(email, phone_number);

    console.log('isBlacklisted:', isBlacklisted);
    if (isBlacklisted) {
      throw new BlacklistedUserError('User is blacklisted and cannot be onboarded');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const { user, wallet } = await db.transaction(async (trx) => {
      const user = await userRepository.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        first_name,
        last_name,
        phone_number,
        is_blacklisted: false,
      });

      const wallet = await walletRepository.create(user.id, trx);

      return { user, wallet };
    });

    return {
      user: this.formatUserResponse(user),
      account_number: wallet.account_number
    };
  }

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    if (user.is_blacklisted) {
      throw new BlacklistedUserError('User account is blacklisted');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const wallet = await walletRepository.findByUserId(user.id);
    if (!wallet) {
      throw new Error('Wallet not found for user');
    }

    const token = this.generateToken(user);

    return {
      user: this.formatUserResponse(user),
      account_number: wallet.account_number,
      token,
    };
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return this.formatUserResponse(user);
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      const user = await userRepository.findById(decoded.userId);
      return user;
    } catch {
      return null;
    }
  }

  private generateToken(user: User): string {
    const payload = { userId: user.id, email: user.email };
    return jwt.sign(payload, config.jwt.secret, { 
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
    });
  }

  private formatUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }
}

export const authService = new AuthService();
