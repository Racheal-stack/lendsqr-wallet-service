export interface Wallet {
  id: string;
  user_id: string;
  account_number: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WalletResponse {
  id: string;
  user_id: string;
  account_number: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: Date;
}

export interface FundWalletDTO {
  amount: number;
  description?: string;
}

export interface TransferDTO {
  recipient_account_number: string;
  recipient_name?: string;
  amount: number;
  description?: string;
}

export interface WithdrawDTO {
  amount: number;
  description?: string;
}
