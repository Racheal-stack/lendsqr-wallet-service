import createApp from './app';
import config from './config';
import db from './database/connection';

const app = createApp();

const startServer = async (): Promise<void> => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');

    app.listen(config.port, () => {
      console.log(`
🚀 Demo Credit Wallet Service
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on port ${config.port}
🌍 Environment: ${config.env}
📝 API Base URL: http://localhost:${config.port}/api/v1
💚 Health Check: http://localhost:${config.port}/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await db.destroy();
  process.exit(0);
});

startServer();
