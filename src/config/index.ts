import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
}

interface AdjutorConfig {
  apiUrl: string;
  apiKey: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface AppConfig {
  env: string;
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  adjutor: AdjutorConfig;
  rateLimit: RateLimitConfig;
}

const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lendsqr_wallet',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  adjutor: {
    apiUrl: process.env.ADJUTOR_API_URL || 'https://adjutor.lendsqr.com/v2',
    apiKey: process.env.ADJUTOR_API_KEY || '',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

export default config;
