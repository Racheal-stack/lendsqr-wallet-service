import { User } from '../../models/user.model';
import { Wallet } from '../../models/wallet.model';
import { Transaction, TransactionType, TransactionStatus } from '../../models/transaction.model';
import crypto from 'crypto';

const generateTestUUID = (): string => {
  return crypto.randomUUID();
};

const generateTestReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: generateTestUUID(),
  email: 'test@example.com',
  password: '$2a$10$hashedpassword',
  first_name: 'Test',
  last_name: 'User',
  phone_number: '+2348012345678',
  is_blacklisted: false,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const createMockWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  id: generateTestUUID(),
  user_id: generateTestUUID(),
  account_number: '12345678901',
  balance: 1000,
  currency: 'NGN',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: generateTestUUID(),
  wallet_id: generateTestUUID(),
  reference_wallet_id: null,
  type: TransactionType.FUNDING,
  amount: 100,
  balance_before: 1000,
  balance_after: 1100,
  reference: generateTestReference(),
  description: 'Test transaction',
  status: TransactionStatus.COMPLETED,
  metadata: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...overrides,
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn();
