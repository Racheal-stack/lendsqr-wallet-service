# Demo Credit Wallet Service

A wallet service for mobile lending apps built with Node.js, TypeScript, and MySQL. This service handles user registration, wallet management, fund transfers, and integrates with Lendsqr's Karma API for blacklist verification.

## Database Design (E-R Diagram)

### Entity Relationship Diagram

Entity Relationship URL: https://dbdesigner.page.link/pTqdxnqUAQC2sWji6

```
┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ PK: id (UUID)       │
│ email (UNIQUE)      │
│ password            │
│ first_name          │
│ last_name           │
│ phone_number        │
│ is_blacklisted      │
│ is_active           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
          │
          │ 1:1
          │
          ▼
┌─────────────────────┐
│      WALLETS        │
├─────────────────────┤
│ PK: id (UUID)       │
│ FK: user_id (UNIQUE)│
│ account_number      │
│ balance (DECIMAL)   │
│ currency            │
│ is_active           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────┐
│    TRANSACTIONS     │
├─────────────────────┤
│ PK: id (UUID)       │
│ FK: wallet_id       │
│ FK: reference_wallet│
│ type (ENUM)         │
│ amount (DECIMAL)    │
│ balance_before      │
│ balance_after       │
│ reference (UNIQUE)  │
│ description         │
│ status (ENUM)       │
│ metadata (JSON)     │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

### Relationships

- **Users → Wallets**: One-to-One (Each user has exactly one wallet)
- **Wallets → Transactions**: One-to-Many (Each wallet can have multiple transactions)
- **Transactions → Wallets**: Many-to-One (reference_wallet_id for transfers)

### Key Design Decisions

- **UUID Primary Keys**: Prevents enumeration attacks and ensures uniqueness
- **DECIMAL for Money**: Avoids floating-point precision issues (15,2 precision)
- **Unique Constraints**: Email, phone_number, account_number, transaction reference
- **Foreign Keys**: Enforces referential integrity
- **Indexes**: On email, phone_number, account_number, wallet_id for query performance
- **Audit Trail**: balance_before and balance_after in transactions
- **ENUM Types**: For transaction type (FUNDING, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT) and status

## Features

- User registration and JWT authentication
- Wallet creation with unique 11-digit account numbers  
- Fund wallet, transfer funds, and withdraw operations
- Transaction history with pagination
- Karma blacklist integration to prevent fraudulent users
- Database transactions with row-level locking for data consistency
- Comprehensive test coverage

## Tech Stack

- Node.js 18+ & TypeScript
- Express.js
- MySQL with Knex.js
- JWT for authentication
- bcrypt for password hashing
- Jest for testing

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MySQL 8.0+

### Installation

Clone the repository:
```bash
git clone https://github.com/Racheal-stack/lendsqr-wallet-service.git
cd lendsqr-wallet-service
```

Install dependencies:
```bash
npm install
```

Set up your environment variables by copying the example file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lendsqr_wallet

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

ADJUTOR_API_URL=https://adjutor.lendsqr.com/v2
ADJUTOR_API_KEY=your_api_key

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create the database:
```bash
mysql -u root -p
CREATE DATABASE lendsqr_wallet;
```

Run migrations:
```bash
npm run migrate
```

Optionally seed test data:
```bash
npm run seed
```

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication

**Register**
```
POST /auth/register
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "08012345678"
}
```

**Login**
```
POST /auth/login
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Get Profile**
```
GET /auth/me
Authorization: Bearer <token>
```

### Wallet Operations

All wallet endpoints require authentication.

**Get Wallet**
```
GET /wallet
Authorization: Bearer <token>
```

**Get Balance**
```
GET /wallet/balance
Authorization: Bearer <token>
```

**Fund Wallet**
```
POST /wallet/fund
Authorization: Bearer <token>
```
Body:
```json
{
  "amount": 1000.00,
  "description": "Wallet funding"
}
```

**Transfer Funds**
```
POST /wallet/transfer
Authorization: Bearer <token>
```
Body:
```json
{
  "recipient_account_number": "98765432109",
  "amount": 500.00,
  "description": "Payment for services"
}
```

**Withdraw**
```
POST /wallet/withdraw
Authorization: Bearer <token>
```
Body:
```json
{
  "amount": 300.00,
  "description": "Cash withdrawal"
}
```

**Transaction History**
```
GET /wallet/transactions?page=1&limit=10
Authorization: Bearer <token>
```

### Blacklist Management

**Check Karma Status**
```
POST /auth/check-karma
```
Body:
```json
{
  "identity": "user@example.com"
}
```

**Get Blacklisted Users**
```
GET /auth/blacklist
Authorization: Bearer <token>
```

**Get Blacklist Stats**
```
GET /auth/blacklist-stats
Authorization: Bearer <token>
```

## Database Schema

### Users
- Stores user account information
- Password is hashed with bcrypt
- Tracks blacklist status

### Wallets  
- One wallet per user
- 11-digit unique account number for transfers
- Balance stored with 2 decimal precision

### Transactions
- Records all wallet operations (funding, transfers, withdrawals)
- Stores before/after balances for audit trail
- Unique reference for each transaction

## Security

- JWT tokens for authentication
- Passwords hashed with bcrypt (10 rounds)
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- CORS protection
- Database transactions with row-level locking
- Input validation on all endpoints
- Karma API integration to block blacklisted users

## Testing

Run the test suite:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

Current test coverage: 79%

## Project Structure

```
src/
├── config/              # Configuration
├── controllers/         # Request handlers
├── database/            
│   ├── migrations/      # Database migrations
│   └── seeds/           # Seed data
├── middlewares/         # Express middlewares
├── models/              # TypeScript interfaces
├── repositories/        # Data access layer
├── routes/              # API routes
├── services/            # Business logic
├── tests/               # Test files
├── utils/               # Helper functions
├── validators/          # Input validation
├── app.ts              # Express setup
└── index.ts            # Entry point
```

## Deployment

The service is configured for deployment on Railway.

Production URL: `https://racheal-lendsqr-be-test.up.railway.app`

Build for production:
```bash
npm run build
npm start
```

Health check endpoint:
```
GET /api/v1/health
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment mode | No |
| PORT | Server port | No |
| DB_HOST | MySQL host | Yes |
| DB_USER | MySQL username | Yes |
| DB_PASSWORD | MySQL password | Yes |
| DB_NAME | Database name | Yes |
| JWT_SECRET | JWT signing key | Yes |
| ADJUTOR_API_KEY | Karma API key | Yes |

## License

ISC

## Author

Racheal - [GitHub](https://github.com/Racheal-stack)
