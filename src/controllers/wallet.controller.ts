import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/wallet.service';
import { successResponse, paginatedResponse } from '../utils/response';

export class WalletController {
 
  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const wallet = await walletService.getWalletByUserId(userId);

      successResponse(res, 'Wallet retrieved successfully', wallet);
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const balance = await walletService.getBalance(userId);

      successResponse(res, 'Balance retrieved successfully', balance);
    } catch (error) {
      next(error);
    }
  }

  async fundWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { amount, description } = req.body;

      const transaction = await walletService.fundWallet(userId, { amount, description });

      successResponse(res, 'Wallet funded successfully', transaction);
    } catch (error) {
      next(error);
    }
  }

  async transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { recipient_account_number, recipient_name, amount, description } = req.body;

      const transaction = await walletService.transfer(userId, {
        recipient_account_number,
        recipient_name,
        amount,
        description,
      });

      successResponse(res, 'Transfer successful', transaction);
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { amount, description } = req.body;

      const transaction = await walletService.withdraw(userId, { amount, description });

      successResponse(res, 'Withdrawal successful', transaction);
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { transactions, total } = await walletService.getTransactionHistory(
        userId,
        page,
        limit
      );

      paginatedResponse(res, 'Transactions retrieved successfully', transactions, page, limit, total);
    } catch (error) {
      next(error);
    }
  }
}

export const walletController = new WalletController();
