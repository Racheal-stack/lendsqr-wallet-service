import { WalletService } from '../../services/wallet.service';
import { walletRepository } from '../../repositories/wallet.repository';
import { transactionRepository } from '../../repositories/transaction.repository';
import { userRepository } from '../../repositories/user.repository';
import { BadRequestError, NotFoundError, InsufficientFundsError, ForbiddenError } from '../../utils/errors';
import { TransactionType } from '../../models/transaction.model';
import { createMockUser, createMockWallet, createMockTransaction } from '../mocks';
import db from '../../database/connection';

// Mock dependencies
jest.mock('../../repositories/wallet.repository');
jest.mock('../../repositories/transaction.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../../database/connection');

describe('WalletService', () => {
  let walletService: WalletService;
  let mockTrx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    walletService = new WalletService();
    
    // Mock transaction
    mockTrx = {};
    (db.transaction as jest.Mock) = jest.fn().mockImplementation(async (callback) => {
      return callback(mockTrx);
    });
  });

  describe('getWalletByUserId', () => {
    it('should return wallet for valid user', async () => {
      const mockWallet = createMockWallet();
      (walletRepository.findByUserId as jest.Mock).mockResolvedValue(mockWallet);

      const result = await walletService.getWalletByUserId(mockWallet.user_id);

      expect(result).toBeDefined();
      expect(result.balance).toBe(mockWallet.balance);
      expect(walletRepository.findByUserId).toHaveBeenCalledWith(mockWallet.user_id);
    });

    it('should throw NotFoundError if wallet does not exist', async () => {
      (walletRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      await expect(walletService.getWalletByUserId('non-existent-user'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getBalance', () => {
    it('should return balance and currency', async () => {
      const mockWallet = createMockWallet({ balance: 5000 });
      (walletRepository.findByUserId as jest.Mock).mockResolvedValue(mockWallet);

      const result = await walletService.getBalance(mockWallet.user_id);

      expect(result.balance).toBe(5000);
      expect(result.currency).toBe('NGN');
    });

    it('should throw NotFoundError if wallet not found', async () => {
      (walletRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      await expect(walletService.getBalance('invalid-user'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('fundWallet', () => {
    it('should successfully fund wallet', async () => {
      const mockWallet = createMockWallet({ balance: 1000 });
      const mockTransaction = createMockTransaction({
        type: TransactionType.FUNDING,
        amount: 500,
        balance_before: 1000,
        balance_after: 1500,
      });

      (walletRepository.findByUserIdForUpdate as jest.Mock).mockResolvedValue(mockWallet);
      (walletRepository.updateBalance as jest.Mock).mockResolvedValue({ ...mockWallet, balance: 1500 });
      (transactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await walletService.fundWallet(mockWallet.user_id, { amount: 500 });

      expect(result.amount).toBe(500);
      expect(result.type).toBe(TransactionType.FUNDING);
      expect(result.balance_after).toBe(1500);
    });

    it('should throw BadRequestError for invalid amount', async () => {
      await expect(walletService.fundWallet('user-id', { amount: 0 }))
        .rejects.toThrow(BadRequestError);
      
      await expect(walletService.fundWallet('user-id', { amount: -100 }))
        .rejects.toThrow(BadRequestError);
      
      await expect(walletService.fundWallet('user-id', { amount: 100.123 }))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if wallet not found', async () => {
      (walletRepository.findByUserIdForUpdate as jest.Mock).mockResolvedValue(null);

      await expect(walletService.fundWallet('invalid-user', { amount: 100 }))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if wallet is deactivated', async () => {
      const mockWallet = createMockWallet({ is_active: false });
      (walletRepository.findByUserIdForUpdate as jest.Mock).mockResolvedValue(mockWallet);

      await expect(walletService.fundWallet(mockWallet.user_id, { amount: 100 }))
        .rejects.toThrow(ForbiddenError);
    });
  });

  describe('transfer', () => {
    it('should successfully transfer funds', async () => {
      const senderUser = createMockUser({ id: 'sender-id', first_name: 'John', last_name: 'Doe' });
      const senderWallet = createMockWallet({ user_id: 'sender-id', balance: 1000, account_number: '12345678901' });
      const recipientUser = createMockUser({ id: 'recipient-id', first_name: 'Jane', last_name: 'Smith' });
      const recipientWallet = createMockWallet({ user_id: 'recipient-id', balance: 500, account_number: '98765432109' });
      const mockTransaction = createMockTransaction({
        type: TransactionType.TRANSFER_OUT,
        amount: 300,
        balance_before: 1000,
        balance_after: 700,
      });

      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce(senderUser)
        .mockResolvedValueOnce(recipientUser);
      (walletRepository.findByAccountNumber as jest.Mock).mockResolvedValue(recipientWallet);
      (walletRepository.findByUserIdForUpdate as jest.Mock)
        .mockResolvedValueOnce(senderWallet);
      (walletRepository.findByIdForUpdate as jest.Mock).mockResolvedValue(recipientWallet);
      (walletRepository.updateBalance as jest.Mock).mockResolvedValue({});
      (transactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await walletService.transfer(senderWallet.user_id, {
        recipient_account_number: '98765432109',
        amount: 300,
      });

      expect(result.amount).toBe(300);
      expect(result.type).toBe(TransactionType.TRANSFER_OUT);
    });

    it('should throw BadRequestError for self-transfer', async () => {
      const mockWallet = createMockWallet({ user_id: 'user-id', account_number: '12345678901' });
      (walletRepository.findByAccountNumber as jest.Mock).mockResolvedValue(mockWallet);

      await expect(walletService.transfer('user-id', {
        recipient_account_number: '12345678901',
        amount: 100,
      })).rejects.toThrow(BadRequestError);
      await expect(walletService.transfer('user-id', {
        recipient_account_number: '12345678901',
        amount: 100,
      })).rejects.toThrow('Cannot transfer to yourself');
    });

    it('should throw BadRequestError if recipient wallet is inactive', async () => {
      const recipientWallet = createMockWallet({ user_id: 'recipient-id', is_active: false, account_number: '98765432109' });
      (walletRepository.findByAccountNumber as jest.Mock).mockResolvedValue(recipientWallet);

      await expect(walletService.transfer('sender-id', {
        recipient_account_number: '98765432109',
        amount: 100,
      })).rejects.toThrow(BadRequestError);
    });

    it('should throw InsufficientFundsError for insufficient balance', async () => {
      const senderUser = createMockUser({ id: 'sender-id', first_name: 'John', last_name: 'Doe' });
      const senderWallet = createMockWallet({ user_id: 'sender-id', balance: 50, account_number: '12345678901' });
      const recipientUser = createMockUser({ id: 'recipient-id', first_name: 'Jane', last_name: 'Smith' });
      const recipientWallet = createMockWallet({ user_id: 'recipient-id', account_number: '98765432109' });

      (userRepository.findById as jest.Mock)
        .mockResolvedValueOnce(senderUser)
        .mockResolvedValueOnce(recipientUser);
      (walletRepository.findByAccountNumber as jest.Mock).mockResolvedValue(recipientWallet);
      (walletRepository.findByUserIdForUpdate as jest.Mock)
        .mockResolvedValueOnce(senderWallet);
      (walletRepository.findByIdForUpdate as jest.Mock).mockResolvedValue(recipientWallet);

      await expect(walletService.transfer(senderWallet.user_id, {
        recipient_account_number: '98765432109',
        amount: 100,
      })).rejects.toThrow(InsufficientFundsError);
    });
  });

  describe('withdraw', () => {
    it('should successfully withdraw funds', async () => {
      const mockWallet = createMockWallet({ balance: 500 });
      const mockTransaction = createMockTransaction({
        type: TransactionType.WITHDRAWAL,
        amount: 300,
        balance_before: 500,
        balance_after: 200,
      });

      (walletRepository.findByUserIdForUpdate as jest.Mock).mockResolvedValue(mockWallet);
      (walletRepository.updateBalance as jest.Mock).mockResolvedValue({ ...mockWallet, balance: 700 });
      (transactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await walletService.withdraw(mockWallet.user_id, { amount: 300 });

      expect(result.amount).toBe(300);
      expect(result.type).toBe(TransactionType.WITHDRAWAL);
      expect(result.balance_after).toBe(200);
    });

    it('should throw BadRequestError for invalid amount', async () => {
      await expect(walletService.withdraw('user-id', { amount: 0 }))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if wallet not found', async () => {
      (walletRepository.findByUserIdForUpdate as jest.Mock).mockResolvedValueOnce(null);

      await expect(walletService.withdraw('invalid-user', { amount: 100 }))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if wallet is deactivated', async () => {
      const mockWallet = createMockWallet({ is_active: false });
      (walletRepository.findByUserIdForUpdate as jest.Mock).mockResolvedValue(mockWallet);

      await expect(walletService.withdraw(mockWallet.user_id, { amount: 100 }))
        .rejects.toThrow(ForbiddenError);
    });

    it('should throw InsufficientFundsError for insufficient balance', async () => {
      const mockWallet = createMockWallet({ balance: 50 });
      (walletRepository.findByUserIdForUpdate as jest.Mock).mockResolvedValue(mockWallet);

      await expect(walletService.withdraw(mockWallet.user_id, { amount: 100 }))
        .rejects.toThrow(InsufficientFundsError);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      const mockWallet = createMockWallet();
      const mockTransactions = [
        createMockTransaction(),
        createMockTransaction(),
      ];

      (walletRepository.findByUserId as jest.Mock).mockResolvedValue(mockWallet);
      (transactionRepository.findByWalletId as jest.Mock).mockResolvedValue({
        transactions: mockTransactions,
        total: 2,
      });

      const result = await walletService.getTransactionHistory(mockWallet.user_id, 1, 10);

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should throw NotFoundError if wallet not found', async () => {
      (walletRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      await expect(walletService.getTransactionHistory('invalid-user'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
