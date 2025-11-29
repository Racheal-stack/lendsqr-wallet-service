export interface User {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_blacklisted: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  created_at: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  account_number: string;
  token?: string;
}
