import {
  generateTransactionReference,
  formatAmount,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeString,
  isValidAmount,
  safeJsonParse,
} from '../../utils/helpers';

describe('Helper Utilities', () => {
  describe('generateTransactionReference', () => {
    it('should generate a transaction reference with correct format', () => {
      const reference = generateTransactionReference();
      expect(reference).toMatch(/^TXN-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it('should generate unique references', () => {
      const ref1 = generateTransactionReference();
      const ref2 = generateTransactionReference();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('formatAmount', () => {
    it('should format amount to 2 decimal places', () => {
      expect(formatAmount(100.456)).toBe(100.46);
      expect(formatAmount(100.454)).toBe(100.45);
      expect(formatAmount(100)).toBe(100);
    });

    it('should handle very small amounts', () => {
      expect(formatAmount(0.001)).toBe(0);
      expect(formatAmount(0.01)).toBe(0.01);
    });

    it('should handle negative amounts', () => {
      expect(formatAmount(-100.456)).toBe(-100.46);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should return true for valid Nigerian phone numbers', () => {
      expect(isValidPhoneNumber('+2348012345678')).toBe(true);
      expect(isValidPhoneNumber('08012345678')).toBe(true);
      expect(isValidPhoneNumber('+2349012345678')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhoneNumber('12345')).toBe(false);
      expect(isValidPhoneNumber('+1234567890')).toBe(false);
      expect(isValidPhoneNumber('080123456789')).toBe(false); // too many digits
      expect(isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('isValidAmount', () => {
    it('should return true for valid amounts', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(100.50)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
      expect(isValidAmount(1000000)).toBe(true);
    });

    it('should return false for invalid amounts', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(100.123)).toBe(false); // more than 2 decimal places
      expect(isValidAmount(NaN)).toBe(false);
      expect(isValidAmount('100' as any)).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      expect(safeJsonParse('{"key": "value"}', {})).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      expect(safeJsonParse('invalid json', { default: true })).toEqual({ default: true });
    });

    it('should return fallback for empty string', () => {
      expect(safeJsonParse('', [])).toEqual([]);
    });
  });
});
