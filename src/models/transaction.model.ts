export enum TransactionType {
  FUNDING = 'FUNDING',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export interface Transaction {
  id: string;
  wallet_id: string;
  reference_wallet_id: string | null;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  description: string | null;
  status: TransactionStatus;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  description: string | null;
  status: TransactionStatus;
  created_at: Date;
}

export interface CreateTransactionDTO {
  wallet_id: string;
  reference_wallet_id?: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  metadata?: Record<string, unknown>;
}
