import { Knex } from 'knex';
import db from '../database/connection';
import { Transaction, CreateTransactionDTO, TransactionStatus } from '../models/transaction.model';
import { generateUUID, generateTransactionReference } from '../utils/helpers';

export class TransactionRepository {
  private tableName = 'transactions';

  async create(transactionData: CreateTransactionDTO, trx: Knex.Transaction): Promise<Transaction> {
    const id = generateUUID();
    const reference = generateTransactionReference();
    
    const transaction = {
      id,
      reference,
      wallet_id: transactionData.wallet_id,
      reference_wallet_id: transactionData.reference_wallet_id || null,
      type: transactionData.type,
      amount: transactionData.amount,
      balance_before: transactionData.balance_before,
      balance_after: transactionData.balance_after,
      description: transactionData.description || null,
      status: TransactionStatus.COMPLETED,
      metadata: transactionData.metadata ? JSON.stringify(transactionData.metadata) : null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await trx(this.tableName).insert(transaction);
    return this.findById(id, trx) as Promise<Transaction>;
  }

  async findById(id: string, trx?: Knex.Transaction): Promise<Transaction | null> {
    const connection = trx || db;
    const transaction = await connection(this.tableName).where({ id }).first();
    
    if (transaction && transaction.metadata) {
      transaction.metadata = typeof transaction.metadata === 'string' 
        ? JSON.parse(transaction.metadata) 
        : transaction.metadata;
    }
    
    return transaction || null;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const transaction = await db(this.tableName).where({ reference }).first();
    
    if (transaction && transaction.metadata) {
      transaction.metadata = typeof transaction.metadata === 'string' 
        ? JSON.parse(transaction.metadata) 
        : transaction.metadata;
    }
    
    return transaction || null;
  }

  async findByWalletId(
    walletId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const offset = (page - 1) * limit;

    const [transactions, [{ total }]] = await Promise.all([
      db(this.tableName)
        .where({ wallet_id: walletId })
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db(this.tableName)
        .where({ wallet_id: walletId })
        .count('id as total'),
    ]);

    return {
      transactions: transactions.map((t: Transaction) => ({
        ...t,
        metadata: t.metadata && typeof t.metadata === 'string' 
          ? JSON.parse(t.metadata) 
          : t.metadata,
      })),
      total: Number(total),
    };
  }

  async updateStatus(id: string, status: TransactionStatus, trx?: Knex.Transaction): Promise<Transaction | null> {
    const connection = trx || db;
    await connection(this.tableName)
      .where({ id })
      .update({
        status,
        updated_at: new Date(),
      });
    return this.findById(id, trx);
  }

  async getTransactionsByDateRange(
    walletId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const transactions = await db(this.tableName)
      .where({ wallet_id: walletId })
      .whereBetween('created_at', [startDate, endDate])
      .orderBy('created_at', 'desc');

    return transactions.map((t: Transaction) => ({
      ...t,
      metadata: t.metadata && typeof t.metadata === 'string' 
        ? JSON.parse(t.metadata) 
        : t.metadata,
    }));
  }
}

export const transactionRepository = new TransactionRepository();
