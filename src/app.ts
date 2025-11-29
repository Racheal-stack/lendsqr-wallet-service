import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';

const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

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

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Demo Credit Wallet Service API',
      version: '1.0.0',
      documentation: '/api/v1/health',
    });
  });

  app.use('/api/v1', routes);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
};

export default createApp;
