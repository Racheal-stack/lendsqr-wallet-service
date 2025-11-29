import { Router } from 'express';
import authRoutes from './auth.routes';
import walletRoutes from './wallet.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Demo Credit Wallet Service is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);

export default router;
