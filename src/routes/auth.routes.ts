import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { registerValidation, loginValidation } from '../validators';

const router = Router();

router.post('/register', registerValidation, (req, res, next) => {
  authController.register(req, res, next);
});

router.post('/login', loginValidation, (req, res, next) => {
  authController.login(req, res, next);
});

router.get('/me', authenticate, (req, res, next) => {
  authController.getProfile(req, res, next);
});

router.get('/blacklist', authenticate, (req, res, next) => {
  authController.getBlacklistedUsers(req, res, next);
});

router.get('/clean-users', authenticate, (req, res, next) => {
  authController.getNonBlacklistedUsers(req, res, next);
});

router.get('/blacklist-stats', authenticate, (req, res, next) => {
  authController.getBlacklistStats(req, res, next);
});

router.post('/check-karma', (req, res, next) => {
  authController.checkKarma(req, res, next);
});

export default router;
