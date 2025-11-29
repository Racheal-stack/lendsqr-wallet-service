import { Knex } from 'knex';
import db from '../database/connection';
import { Wallet } from '../models/wallet.model';
import { generateUUID } from '../utils/helpers';

export class WalletRepository {
  private tableName = 'wallets';

  private async generateAccountNumber(): Promise<string> {
    let accountNumber: string;
    let exists = true;

    while (exists) {
      accountNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();
      
      const existing = await db(this.tableName).where({ account_number: accountNumber }).first();
      exists = !!existing;
    }

    return accountNumber!;
  }

  async create(userId: string, trx?: Knex.Transaction): Promise<Wallet> {
    const connection = trx || db;
    const id = generateUUID();
    const accountNumber = await this.generateAccountNumber();
    
    const wallet = {
      id,
      user_id: userId,
      account_number: accountNumber,
      balance: 0,
      currency: 'NGN',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await connection(this.tableName).insert(wallet);
    return this.findById(id, trx) as Promise<Wallet>;
  }

  async findById(id: string, trx?: Knex.Transaction): Promise<Wallet | null> {
    const connection = trx || db;
    const wallet = await connection(this.tableName).where({ id }).first();
    return wallet || null;
  }

  async findByUserId(userId: string, trx?: Knex.Transaction): Promise<Wallet | null> {
    const connection = trx || db;
    const wallet = await connection(this.tableName).where({ user_id: userId }).first();
    return wallet || null;
  }

  async findByAccountNumber(accountNumber: string, trx?: Knex.Transaction): Promise<Wallet | null> {
    const connection = trx || db;
    const wallet = await connection(this.tableName).where({ account_number: accountNumber }).first();
    return wallet || null;
  }

  async findByUserIdForUpdate(userId: string, trx: Knex.Transaction): Promise<Wallet | null> {
    const wallet = await trx(this.tableName)
      .where({ user_id: userId })
      .forUpdate()
      .first();
    return wallet || null;
  }

  async findByIdForUpdate(id: string, trx: Knex.Transaction): Promise<Wallet | null> {
    const wallet = await trx(this.tableName)
      .where({ id })
      .forUpdate()
      .first();
    return wallet || null;
  }

  async updateBalance(id: string, newBalance: number, trx: Knex.Transaction): Promise<Wallet | null> {
    await trx(this.tableName)
      .where({ id })
      .update({
        balance: newBalance,
        updated_at: new Date(),
      });
    return this.findById(id, trx);
  }

  async creditBalance(id: string, amount: number, trx: Knex.Transaction): Promise<Wallet | null> {
    await trx(this.tableName)
      .where({ id })
      .increment('balance', amount)
      .update({ updated_at: new Date() });
    return this.findById(id, trx);
  }

  async debitBalance(id: string, amount: number, trx: Knex.Transaction): Promise<Wallet | null> {
    await trx(this.tableName)
      .where({ id })
      .decrement('balance', amount)
      .update({ updated_at: new Date() });
    return this.findById(id, trx);
  }

  async deactivate(id: string): Promise<boolean> {
    const updated = await db(this.tableName)
      .where({ id })
      .update({
        is_active: false,
        updated_at: new Date(),
      });
    return updated > 0;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findByUserId(userId);
    return wallet?.balance || 0;
  }
}

export const walletRepository = new WalletRepository();
