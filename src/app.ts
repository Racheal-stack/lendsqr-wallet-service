import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // API routes
  // TODO: Add routes here when ready
  // app.use('/api/v1/users', userRoutes);
  // app.use('/api/v1/wallets', walletRoutes);
  // app.use('/api/v1/transactions', transactionRoutes);

  // Health check endpoint
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      success: true,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Demo Credit Wallet Service API',
      version: '1.0.0',
      documentation: '/api/v1/health',
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
