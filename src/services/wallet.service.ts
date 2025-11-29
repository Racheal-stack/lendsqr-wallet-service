import db from '../database/connection';
import { walletRepository } from '../repositories/wallet.repository';
import { transactionRepository } from '../repositories/transaction.repository';
import { userRepository } from '../repositories/user.repository';
import { Wallet, WalletResponse, FundWalletDTO, TransferDTO, WithdrawDTO } from '../models/wallet.model';
import { TransactionType, TransactionResponse } from '../models/transaction.model';
import { 
  BadRequestError, 
  NotFoundError, 
  InsufficientFundsError,
  ForbiddenError 
} from '../utils/errors';
import { formatAmount, isValidAmount } from '../utils/helpers';

export class WalletService {
  async getWalletByUserId(userId: string): Promise<WalletResponse> {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    return this.formatWalletResponse(wallet);
  }

  async getBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    return {
      balance: Number(wallet.balance),
      currency: wallet.currency,
    };
  }

  async fundWallet(userId: string, fundData: FundWalletDTO): Promise<TransactionResponse> {
    const { amount, description } = fundData;

    if (!isValidAmount(amount)) {
      throw new BadRequestError('Invalid amount. Amount must be a positive number with max 2 decimal places');
    }

    const formattedAmount = formatAmount(amount);

    const transaction = await db.transaction(async (trx) => {
      const wallet = await walletRepository.findByUserIdForUpdate(userId, trx);
      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      if (!wallet.is_active) {
        throw new ForbiddenError('Wallet is deactivated');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = formatAmount(balanceBefore + formattedAmount);

      await walletRepository.updateBalance(wallet.id, balanceAfter, trx);

      const txn = await transactionRepository.create({
        wallet_id: wallet.id,
        type: TransactionType.FUNDING,
        amount: formattedAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: description || 'Wallet funding',
        metadata: { source: 'direct_funding' },
      }, trx);

      return txn;
    });

    return this.formatTransactionResponse(transaction);
  }

  async transfer(userId: string, transferData: TransferDTO): Promise<TransactionResponse> {
    const { recipient_account_number, amount, description } = transferData;

    if (!isValidAmount(amount)) {
      throw new BadRequestError('Invalid amount. Amount must be a positive number with max 2 decimal places');
    }

    const formattedAmount = formatAmount(amount);

    const recipientWallet = await walletRepository.findByAccountNumber(recipient_account_number);
    if (!recipientWallet) {
      throw new NotFoundError('Recipient account not found');
    }

    if (recipientWallet.user_id === userId) {
      throw new BadRequestError('Cannot transfer to yourself');
    }

    if (!recipientWallet.is_active) {
      throw new BadRequestError('Recipient account is not active');
    }

    const transaction = await db.transaction(async (trx) => {
      const senderWallet = await walletRepository.findByUserIdForUpdate(userId, trx);
      if (!senderWallet) {
        throw new NotFoundError('Sender wallet not found');
      }

      if (!senderWallet.is_active) {
        throw new ForbiddenError('Your wallet is deactivated');
      }

      const senderUser = await userRepository.findById(userId);
      if (!senderUser) {
        throw new NotFoundError('Sender user not found');
      }

      const recipientWalletLocked = await walletRepository.findByIdForUpdate(recipientWallet.id, trx);
      if (!recipientWalletLocked) {
        throw new NotFoundError('Recipient wallet not found');
      }

      const recipientUser = await userRepository.findById(recipientWallet.user_id);
      if (!recipientUser) {
        throw new NotFoundError('Recipient user not found');
      }

      const senderBalanceBefore = Number(senderWallet.balance);

      if (senderBalanceBefore < formattedAmount) {
        throw new InsufficientFundsError('Insufficient funds for transfer');
      }

      const senderBalanceAfter = formatAmount(senderBalanceBefore - formattedAmount);
      const recipientBalanceBefore = Number(recipientWallet.balance);
      const recipientBalanceAfter = formatAmount(recipientBalanceBefore + formattedAmount);

      const senderName = `${senderUser.first_name} ${senderUser.last_name}`;
      const recipientName = `${recipientUser.first_name} ${recipientUser.last_name}`;

      await walletRepository.updateBalance(senderWallet.id, senderBalanceAfter, trx);

      await walletRepository.updateBalance(recipientWallet.id, recipientBalanceAfter, trx);

      const senderTxn = await transactionRepository.create({
        wallet_id: senderWallet.id,
        reference_wallet_id: recipientWallet.id,
        type: TransactionType.TRANSFER_OUT,
        amount: formattedAmount,
        balance_before: senderBalanceBefore,
        balance_after: senderBalanceAfter,
        description: description || `Transfer to ${recipientName} (${recipient_account_number})`,
        metadata: {
          recipient_account_number,
          recipient_name: recipientName,
          recipient_wallet_id: recipientWallet.id,
        },
      }, trx);

      await transactionRepository.create({
        wallet_id: recipientWallet.id,
        reference_wallet_id: senderWallet.id,
        type: TransactionType.TRANSFER_IN,
        amount: formattedAmount,
        balance_before: recipientBalanceBefore,
        balance_after: recipientBalanceAfter,
        description: description || `Transfer from ${senderName}`,
        metadata: {
          sender_wallet_id: senderWallet.id,
          sender_account_number: senderWallet.account_number,
          sender_name: senderName,
        },
      }, trx);

      return senderTxn;
    });

    return this.formatTransactionResponse(transaction);
  }

  async withdraw(userId: string, withdrawData: WithdrawDTO): Promise<TransactionResponse> {
    const { amount, description } = withdrawData;

    if (!isValidAmount(amount)) {
      throw new BadRequestError('Invalid amount. Amount must be a positive number with max 2 decimal places');
    }

    const formattedAmount = formatAmount(amount);

    const transaction = await db.transaction(async (trx) => {
      const wallet = await walletRepository.findByUserIdForUpdate(userId, trx);
      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      if (!wallet.is_active) {
        throw new ForbiddenError('Wallet is deactivated');
      }

      const balanceBefore = Number(wallet.balance);

      if (balanceBefore < formattedAmount) {
        throw new InsufficientFundsError('Insufficient funds for withdrawal');
      }

      const balanceAfter = formatAmount(balanceBefore - formattedAmount);

      await walletRepository.updateBalance(wallet.id, balanceAfter, trx);

      const txn = await transactionRepository.create({
        wallet_id: wallet.id,
        type: TransactionType.WITHDRAWAL,
        amount: formattedAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: description || 'Wallet withdrawal',
        metadata: { destination: 'bank_transfer' },
      }, trx);

      return txn;
    });

    return this.formatTransactionResponse(transaction);
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: TransactionResponse[]; total: number }> {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    const { transactions, total } = await transactionRepository.findByWalletId(
      wallet.id,
      page,
      limit
    );

    return {
      transactions: transactions.map(this.formatTransactionResponse),
      total,
    };
  }

  private formatWalletResponse(wallet: Wallet): WalletResponse {
    return {
      id: wallet.id,
      user_id: wallet.user_id,
      account_number: wallet.account_number,
      balance: Number(wallet.balance),
      currency: wallet.currency,
      is_active: wallet.is_active,
      created_at: wallet.created_at,
    };
  }

  private formatTransactionResponse(transaction: any): TransactionResponse {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      balance_before: Number(transaction.balance_before),
      balance_after: Number(transaction.balance_after),
      reference: transaction.reference,
      description: transaction.description,
      status: transaction.status,
      created_at: transaction.created_at,
    };
  }
}

export const walletService = new WalletService();
