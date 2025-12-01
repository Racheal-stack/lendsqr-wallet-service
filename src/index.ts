import createApp from './app';
import config from './config';
import db from './database/connection';

const app = createApp();

const startServer = async (): Promise<void> => {
  try {
    // Try to connect to database, but don't fail if it's not available
    try {
      await db.raw('SELECT 1');
    } catch (dbError) {
      console.error('Database connection failed');
    }

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
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
  await db.destroy();
  process.exit(0);
});

startServer();
