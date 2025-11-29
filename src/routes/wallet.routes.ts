import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { fundWalletValidation, transferValidation, withdrawValidation } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => {
  walletController.getWallet(req, res, next);
});

router.get('/balance', (req, res, next) => {
  walletController.getBalance(req, res, next);
});

router.post('/fund', fundWalletValidation, (req, res, next) => {
  walletController.fundWallet(req, res, next);
});

router.post('/transfer', transferValidation, (req, res, next) => {
  walletController.transfer(req, res, next);
});

router.post('/withdraw', withdrawValidation, (req, res, next) => {
  walletController.withdraw(req, res, next);
});

router.get('/transactions', (req, res, next) => {
  walletController.getTransactions(req, res, next);
});

export default router;
