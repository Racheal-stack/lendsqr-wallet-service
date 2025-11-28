import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';
import { isValidEmail, isValidPhoneNumber, isValidAmount } from '../utils/helpers';

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'amount';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validateField = (value: any, rule: ValidationRule): string | null => {
  const { field, required, type, minLength, maxLength, min, max } = rule;

  // Check required
  if (required && (value === undefined || value === null || value === '')) {
    return `${field} is required`;
  }

  // Skip further validation if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // Type validation
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${field} must be a string`;
      }
      if (minLength && value.length < minLength) {
        return `${field} must be at least ${minLength} characters`;
      }
      if (maxLength && value.length > maxLength) {
        return `${field} must not exceed ${maxLength} characters`;
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return `${field} must be a number`;
      }
      if (min !== undefined && value < min) {
        return `${field} must be at least ${min}`;
      }
      if (max !== undefined && value > max) {
        return `${field} must not exceed ${max}`;
      }
      break;

    case 'email':
      if (!isValidEmail(value)) {
        return `${field} must be a valid email address`;
      }
      break;

    case 'phone':
      if (!isValidPhoneNumber(value)) {
        return `${field} must be a valid Nigerian phone number`;
      }
      break;

    case 'amount':
      if (!isValidAmount(value)) {
        return `${field} must be a positive number with max 2 decimal places`;
      }
      break;
  }

  return null;
};

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];
      const error = validateField(value, rule);
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestError(errors.join(', '));
    }

    next();
  };
};

// Pre-defined validation schemas
export const registerValidation = validate([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, type: 'string', minLength: 6, maxLength: 100 },
  { field: 'first_name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'last_name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'phone_number', required: true, type: 'phone' },
]);

export const loginValidation = validate([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, type: 'string' },
]);

export const fundWalletValidation = validate([
  { field: 'amount', required: true, type: 'amount' },
]);

export const transferValidation = validate([
  { field: 'recipient_email', required: true, type: 'email' },
  { field: 'amount', required: true, type: 'amount' },
]);

export const withdrawValidation = validate([
  { field: 'amount', required: true, type: 'amount' },
]);
