import db from '../database/connection';
import { User, CreateUserDTO } from '../models/user.model';
import { generateUUID } from '../utils/helpers';

export class UserRepository {
  private tableName = 'users';

  async create(userData: CreateUserDTO & { is_blacklisted?: boolean }): Promise<User> {
    const id = generateUUID();
    const user = {
      id,
      ...userData,
      is_blacklisted: userData.is_blacklisted || false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db(this.tableName).insert(user);
    return this.findById(id) as Promise<User>;
  }

  async findById(id: string): Promise<User | null> {
    const user = await db(this.tableName).where({ id }).first();
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await db(this.tableName).where({ email: email.toLowerCase() }).first();
    return user || null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const user = await db(this.tableName).where({ phone_number: phoneNumber }).first();
    return user || null;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    await db(this.tableName)
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date(),
      });
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db(this.tableName).where({ id }).delete();
    return deleted > 0;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [users, [{ total }]] = await Promise.all([
      db(this.tableName)
        .select('*')
        .where({ is_active: true })
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db(this.tableName)
        .where({ is_active: true })
        .count('id as total'),
    ]);

    return { users, total: Number(total) };
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await db(this.tableName).where({ email: email.toLowerCase() }).first();
    return !!user;
  }

  async phoneExists(phoneNumber: string): Promise<boolean> {
    const user = await db(this.tableName).where({ phone_number: phoneNumber }).first();
    return !!user;
  }

  async findBlacklisted(): Promise<User[]> {
    return db(this.tableName)
      .where({ is_blacklisted: true })
      .orderBy('created_at', 'desc');
  }

  async findNonBlacklisted(): Promise<User[]> {
    return db(this.tableName)
      .where({ is_blacklisted: false, is_active: true })
      .orderBy('created_at', 'desc');
  }

  async getBlacklistStats(): Promise<{ total: number; blacklisted: number; clean: number }> {
    const [stats] = await db(this.tableName)
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('SUM(CASE WHEN is_blacklisted = true THEN 1 ELSE 0 END) as blacklisted'),
        db.raw('SUM(CASE WHEN is_blacklisted = false THEN 1 ELSE 0 END) as clean')
      );
    
    return {
      total: Number(stats.total),
      blacklisted: Number(stats.blacklisted),
      clean: Number(stats.clean)
    };
  }
}

export const userRepository = new UserRepository();
