# Demo Credit Wallet Service 💳

A production-ready MVP wallet service for mobile lending apps, built with Node.js, TypeScript, Express, and MySQL.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Test Coverage](https://img.shields.io/badge/coverage-79%25-brightgreen.svg)](https://github.com/Racheal-stack/lendsqr-wallet-service)

## 📋 Table of Contents

- [Features](#features)
- [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Database Schema](#database-schema)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- 🔐 **User Registration & Authentication** - JWT-based secure authentication
- 💰 **Wallet Management** - Create and manage user wallets with unique 11-digit account numbers
- 💸 **Fund Wallet** - Add money to wallet balance
- 🔄 **Transfer Funds** - Send money to other users using account numbers
- 🏧 **Withdraw Funds** - Withdraw money from wallet
- 📊 **Transaction History** - View paginated transaction records
- 🚫 **Karma Blacklist Integration** - Lendsqr Adjutor API integration to prevent blacklisted users

### Security Features
- ✅ Row-level pessimistic locking for concurrent transactions
- ✅ ACID-compliant database transactions
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Input validation and sanitization

## 🗄️ Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       USERS          │
├──────────────────────┤
│ 🔑 id (UUID, PK)     │
│    email (unique)    │
│    password (hashed) │
│    first_name        │
│    last_name         │
│    phone_number      │
│    is_blacklisted    │
│    is_active         │
│    created_at        │
│    updated_at        │
└──────────────────────┘
         │ 1
         │
         │ has one
         │
         ▼ 1
┌──────────────────────┐
│      WALLETS         │
├──────────────────────┤
│ 🔑 id (UUID, PK)     │
│ 🔗 user_id (FK)      │◄─────── UNIQUE (one wallet per user)
│    account_number    │         11-digit unique identifier
│    balance (decimal) │         Precision: 15,2
│    currency (NGN)    │
│    is_active         │
│    created_at        │
│    updated_at        │
└──────────────────────┘
         │ 1
         │
         │ has many
         │
         ▼ *
┌────────────────────────────┐
│      TRANSACTIONS          │
├────────────────────────────┤
│ 🔑 id (UUID, PK)           │
│ 🔗 wallet_id (FK)          │◄─── Source wallet
│ 🔗 reference_wallet_id (FK)│◄─── Destination wallet (nullable)
│    type (ENUM)             │     [FUNDING, WITHDRAWAL, 
│    amount (decimal)        │      TRANSFER_IN, TRANSFER_OUT]
│    balance_before          │
│    balance_after           │
│    reference (unique)      │     Format: TXN-{timestamp}-{random}
│    description             │
│    status (ENUM)           │     [PENDING, COMPLETED, 
│    metadata (JSON)         │      FAILED, REVERSED]
│    created_at              │
│    updated_at              │
└────────────────────────────┘

RELATIONSHIPS:
═══════════════════════════════════════════════════
│ users.id ──────────────> wallets.user_id       │ (1:1)
│ wallets.id ─────────────> transactions.wallet_id│ (1:*)
│ wallets.id ─────────────> transactions.reference_wallet_id│ (optional)
═══════════════════════════════════════════════════

INDEXES:
═══════════════════════════════════════════════════
│ users: email, phone_number                      │
│ wallets: user_id (unique), account_number       │
│ transactions: wallet_id, reference_wallet_id,   │
│               reference, type, status, created_at│
═══════════════════════════════════════════════════
```

### Visual E-R Diagram

![E-R Diagram](https://app.dbdesigner.net/) 

**To view the interactive diagram:**
1. Visit [https://app.dbdesigner.net/](https://app.dbdesigner.net/)
2. Import the schema from `src/database/migrations/`

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Language:** TypeScript 5.9
- **Framework:** Express 5.1
- **Database:** MySQL 8.0
- **ORM/Query Builder:** Knex.js 3.1

### Security & Authentication
- **Password Hashing:** bcryptjs
- **JWT Tokens:** jsonwebtoken
- **Security Headers:** Helmet
- **Rate Limiting:** express-rate-limit
- **CORS:** cors

### Testing
- **Test Framework:** Jest 30.2
- **Test Coverage:** 79% (Services), 87% (Middlewares)
- **API Testing:** Supertest
- **TypeScript Testing:** ts-jest

### External Services
- **Lendsqr Adjutor Karma API:** Blacklist verification

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Controllers Layer           │  ← HTTP Request/Response
│  (auth.controller, wallet.controller)│
├─────────────────────────────────────┤
│          Services Layer             │  ← Business Logic
│   (authService, walletService)      │
├─────────────────────────────────────┤
│        Repositories Layer           │  ← Data Access
│  (userRepo, walletRepo, txnRepo)    │
├─────────────────────────────────────┤
│         Database Layer              │  ← MySQL with Knex
│      (Migrations & Seeds)           │
└─────────────────────────────────────┘
```

### Design Patterns
- ✅ **Repository Pattern** - Data access abstraction
- ✅ **Dependency Injection** - Loose coupling
- ✅ **Singleton Pattern** - Service instances
- ✅ **Factory Pattern** - Application creation
- ✅ **Middleware Pattern** - Request processing pipeline

### Key Architectural Decisions
1. **Pessimistic Locking** - Row-level locks with `SELECT FOR UPDATE` for financial transactions
2. **ACID Transactions** - Database transactions ensure data consistency
3. **UUID Primary Keys** - Prevents enumeration attacks
4. **Decimal Precision** - All amounts stored with 2 decimal places (15,2)
5. **Unique Account Numbers** - 11-digit account numbers for transfers

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Racheal-stack/lendsqr-wallet-service.git
cd lendsqr-wallet-service
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lendsqr_wallet

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Adjutor API
ADJUTOR_API_URL=https://adjutor.lendsqr.com/v2
ADJUTOR_API_KEY=your_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Create database**
```bash
mysql -u root -p
CREATE DATABASE lendsqr_wallet;
```

5. **Run migrations**
```bash
npm run migrate
```

6. **Seed database (optional)**
```bash
npm run seed
```

7. **Start the server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server will be running at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All wallet endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication

**Register User**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "08012345678"
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "08012345678",
      "is_active": true,
      "created_at": "2025-11-29T10:00:00.000Z"
    },
    "account_number": "12345678901"
  }
}
```

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "account_number": "12345678901",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Get Profile**
```http
GET /api/v1/auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    ...
  }
}
```

#### Wallet Operations

**Get Wallet**
```http
GET /api/v1/wallet
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Wallet retrieved successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "account_number": "12345678901",
    "balance": 5000.00,
    "currency": "NGN",
    "is_active": true,
    "created_at": "2025-11-29T10:00:00.000Z"
  }
}
```

**Get Balance**
```http
GET /api/v1/wallet/balance
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Balance retrieved successfully",
  "data": {
    "balance": 5000.00,
    "currency": "NGN"
  }
}
```

**Fund Wallet**
```http
POST /api/v1/wallet/fund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000.00,
  "description": "Wallet funding"
}

Response 200:
{
  "success": true,
  "message": "Wallet funded successfully",
  "data": {
    "id": "uuid",
    "type": "FUNDING",
    "amount": 1000.00,
    "balance_before": 5000.00,
    "balance_after": 6000.00,
    "reference": "TXN-ABC123-XYZ789",
    "description": "Wallet funding",
    "status": "COMPLETED",
    "created_at": "2025-11-29T10:00:00.000Z"
  }
}
```

**Transfer Funds**
```http
POST /api/v1/wallet/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_account_number": "98765432109",
  "amount": 500.00,
  "description": "Payment for services"
}

Response 200:
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "id": "uuid",
    "type": "TRANSFER_OUT",
    "amount": 500.00,
    "balance_before": 6000.00,
    "balance_after": 5500.00,
    "reference": "TXN-DEF456-UVW123",
    "description": "Transfer to Jane Doe (98765432109)",
    "status": "COMPLETED",
    "created_at": "2025-11-29T10:00:00.000Z"
  }
}
```

**Withdraw Funds**
```http
POST /api/v1/wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 300.00,
  "description": "Bank withdrawal"
}

Response 200:
{
  "success": true,
  "message": "Withdrawal successful",
  "data": {
    "id": "uuid",
    "type": "WITHDRAWAL",
    "amount": 300.00,
    "balance_before": 5500.00,
    "balance_after": 5200.00,
    "reference": "TXN-GHI789-RST456",
    "description": "Bank withdrawal",
    "status": "COMPLETED",
    "created_at": "2025-11-29T10:00:00.000Z"
  }
}
```

**Get Transaction History**
```http
GET /api/v1/wallet/transactions?page=1&limit=10
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Blacklist Management

**Get Blacklisted Users**
```http
GET /api/v1/auth/blacklist
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Blacklisted users retrieved successfully",
  "data": [ ... ]
}
```

**Get Blacklist Statistics**
```http
GET /api/v1/auth/blacklist-stats
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Blacklist statistics retrieved successfully",
  "data": {
    "total": 100,
    "blacklisted": 5,
    "clean": 95
  }
}
```

**Check Karma Status**
```http
POST /api/v1/auth/check-karma
Content-Type: application/json

{
  "identity": "user@example.com"
}

Response 200:
{
  "success": true,
  "message": "Karma check completed",
  "data": {
    "identity": "user@example.com",
    "isBlacklisted": false,
    "status": "CLEAN"
  }
}
```

### Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, invalid amount, etc.)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (blacklisted user, inactive account)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email/phone)
- `500` - Internal Server Error

## 🧪 Testing

### Run Tests

```bash
# All tests with coverage
npm test

# Unit tests only
npm run test:unit

# Watch mode
npm run test:watch
```

### Test Coverage

```
File                        | % Stmts | % Branch | % Funcs | % Lines
----------------------------|---------|----------|---------|--------
All files                   |   79.09 |    68.42 |   73.68 |   79.47
 services                   |   79.09 |    68.42 |   73.33 |   79.47
 middlewares                |   87.27 |    75.00 |   85.71 |   87.27
 utils                      |   94.04 |    83.33 |   92.30 |   94.04
```

### Test Structure

- **Unit Tests:** 105 tests (98 passing)
- **Positive Scenarios:** Happy path testing
- **Negative Scenarios:** Error handling, edge cases
- **Mock Data:** Isolated test environment
- **Coverage:** Services, Middlewares, Utilities, Validators

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone_number)
);
```

### Wallets Table
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  account_number CHAR(11) UNIQUE NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
  currency CHAR(3) DEFAULT 'NGN' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_account_number (account_number)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID NOT NULL,
  reference_wallet_id UUID,
  type ENUM('FUNDING', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  reference VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REVERSED') DEFAULT 'PENDING',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  FOREIGN KEY (reference_wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
  INDEX idx_wallet_id (wallet_id),
  INDEX idx_reference_wallet_id (reference_wallet_id),
  INDEX idx_reference (reference),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

## 🔒 Security

### Implemented Security Measures

1. **Authentication & Authorization**
   - JWT tokens with expiry (24 hours)
   - Password hashing with bcrypt (10 salt rounds)
   - Token verification on protected routes

2. **Input Validation**
   - Email format validation
   - Nigerian phone number validation
   - Amount validation (positive, max 2 decimals)
   - String length validation

3. **Security Headers**
   - Helmet.js for HTTP security headers
   - CORS configuration
   - Rate limiting (100 requests per 15 minutes)

4. **Database Security**
   - Parameterized queries (SQL injection prevention)
   - Row-level locking for concurrent operations
   - Foreign key constraints
   - Unique constraints on sensitive fields

5. **Financial Transaction Safety**
   - ACID transactions
   - Pessimistic locking (`SELECT FOR UPDATE`)
   - Balance validation before debit
   - Audit trail with before/after balances
   - Unique transaction references

6. **Error Handling**
   - No sensitive data in error messages
   - Centralized error handling
   - Operational vs programming errors

7. **External API Security**
   - Lendsqr Karma blacklist verification
   - Prevents blacklisted users from onboarding
   - API timeout configuration (10 seconds)

## 🌍 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | development | No |
| `PORT` | Server port | 3000 | No |
| `DB_HOST` | MySQL host | localhost | Yes |
| `DB_PORT` | MySQL port | 3306 | No |
| `DB_USER` | MySQL user | root | Yes |
| `DB_PASSWORD` | MySQL password | - | Yes |
| `DB_NAME` | Database name | lendsqr_wallet | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiry duration | 24h | No |
| `ADJUTOR_API_URL` | Karma API base URL | https://adjutor.lendsqr.com/v2 | Yes |
| `ADJUTOR_API_KEY` | Karma API key | - | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

## 📁 Project Structure

```
lendsqr-wallet-service/
├── src/
│   ├── config/              # Configuration files
│   │   └── index.ts
│   ├── controllers/         # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── wallet.controller.ts
│   │   └── index.ts
│   ├── database/            # Database layer
│   │   ├── migrations/      # Database migrations
│   │   │   ├── 20241128000001_create_users_table.ts
│   │   │   ├── 20241128000002_create_wallets_table.ts
│   │   │   └── 20241128000003_create_transactions_table.ts
│   │   ├── seeds/           # Seed data
│   │   │   └── 01_seed_users.ts
│   │   ├── connection.ts
│   │   └── knexfile.ts
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── index.ts
│   ├── models/              # TypeScript interfaces
│   │   ├── user.model.ts
│   │   ├── wallet.model.ts
│   │   ├── transaction.model.ts
│   │   └── index.ts
│   ├── repositories/        # Data access layer
│   │   ├── user.repository.ts
│   │   ├── wallet.repository.ts
│   │   ├── transaction.repository.ts
│   │   └── index.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── wallet.routes.ts
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── wallet.service.ts
│   │   ├── adjutor.service.ts
│   │   └── index.ts
│   ├── tests/               # Test files
│   │   ├── mocks/
│   │   ├── unit/
│   │   └── setup.ts
│   ├── utils/               # Utility functions
│   │   ├── errors.ts
│   │   ├── helpers.ts
│   │   ├── response.ts
│   │   └── index.ts
│   ├── validators/          # Input validators
│   │   └── index.ts
│   ├── app.ts               # Express app setup
│   └── index.ts             # Entry point
├── .env.example             # Environment template
├── .gitignore
├── jest.config.js
├── package.json
├── Procfile                 # Deployment config
├── README.md
└── tsconfig.json
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

### Database Migrations on Production

```bash
npm run migrate
```

### Health Check Endpoint

```
GET /api/v1/health
```

Response:
```json
{
  "success": true,
  "message": "Demo Credit Wallet Service is running",
  "timestamp": "2025-11-29T10:00:00.000Z"
}
```


## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Racheal**

- GitHub: [@Racheal-stack](https://github.com/Racheal-stack)
- Repository: [lendsqr-wallet-service](https://github.com/Racheal-stack/lendsqr-wallet-service)

## 🙏 Acknowledgments

- Lendsqr for the Adjutor Karma API
- Node.js and TypeScript communities
- Express.js framework
- Knex.js query builder

---

**Built with ❤️ for Lendsqr**
