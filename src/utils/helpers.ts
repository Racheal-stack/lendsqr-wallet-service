import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const generateUUID = (): string => {
  return uuidv4();
};

export const generateTransactionReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

export const formatAmount = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+234|0)[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidAmount = (amount: number): boolean => {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  if (amount <= 0) return false;
  
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};
