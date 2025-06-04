import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
  validateDate,
  validateStreet,
  validateCity,
  validatePostalCode,
} from '@/utils/validations';
import { Country } from '@/types/enums';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should reject empty email', () => {
      expect(validateEmail('')).toEqual({
        isValid: false,
        message: 'Email is required',
      });
    });

    it('should reject emails with leading/trailing spaces', () => {
      expect(validateEmail(' test@example.com ')).toEqual({
        isValid: false,
        message: 'Email should not contain leading or trailing spaces',
      });
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('test@')).toEqual({
        isValid: false,
        message: 'Please enter a valid email address (e.g., user@example.com)',
      });
      expect(validateEmail('test.example.com')).toEqual({
        isValid: false,
        message: 'Please enter a valid email address (e.g., user@example.com)',
      });
    });

    it('should accept valid emails', () => {
      expect(validateEmail('valid@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user.name+tag@domain.co.uk')).toEqual({ isValid: true });
    });
  });

  describe('validateFirstName', () => {
    it('should reject empty first name', () => {
      expect(validateFirstName('')).toEqual({
        isValid: false,
        message: 'First Name is required',
      });
    });

    it('should reject names with leading/trailing spaces', () => {
      expect(validateFirstName(' John ')).toEqual({
        isValid: false,
        message: 'First Name should not contain leading or trailing spaces',
      });
    });

    it('should reject names with numbers/symbols', () => {
      expect(validateFirstName('John1')).toEqual({
        isValid: false,
        message: 'The first name can only contain letters',
      });
    });

    it('should accept valid names', () => {
      expect(validateFirstName('Éléonore')).toEqual({ isValid: true });
      expect(validateFirstName('John')).toEqual({ isValid: true });
    });
  });

  describe('validateLastName', () => {
    it('should reject empty last name', () => {
      expect(validateLastName('')).toEqual({
        isValid: false,
        message: 'Last Name is required',
      });
    });

    it('should reject names with leading/trailing spaces', () => {
      expect(validateLastName(' Doe ')).toEqual({
        isValid: false,
        message: 'Last Name should not contain leading or trailing spaces',
      });
    });

    it('should reject names with numbers/symbols', () => {
      expect(validateLastName('Doe-Smith')).toEqual({
        isValid: false,
        message: 'The last name can only contain letters',
      });
    });

    it('should accept valid names', () => {
      expect(validateLastName('Müller')).toEqual({ isValid: true });
      expect(validateLastName('Doe')).toEqual({ isValid: true });
    });
  });

  describe('validatePassword', () => {
    it('should reject empty password', () => {
      expect(validatePassword('')).toEqual({
        isValid: false,
        message: 'Password is required',
      });
    });

    it('should reject passwords with leading/trailing spaces', () => {
      expect(validatePassword(' Password123 ')).toEqual({
        isValid: false,
        message: 'Password should not contain leading or trailing spaces',
      });
    });

    it('should enforce minimum length', () => {
      expect(validatePassword('Short1')).toEqual({
        isValid: false,
        message: 'Password must be at least 8 characters long',
      });
    });

    it('should enforce complexity requirements', () => {
      expect(validatePassword('lowercaseonly')).toEqual({
        isValid: false,
        message: 'Password must contain at least one uppercase letter',
      });
      expect(validatePassword('UPPERCASEONLY')).toEqual({
        isValid: false,
        message: 'Password must contain at least one lowercase letter',
      });
      expect(validatePassword('NoNumbersHere')).toEqual({
        isValid: false,
        message: 'Password must contain at least one number',
      });
    });

    it('should accept valid passwords', () => {
      expect(validatePassword('ValidPass123')).toEqual({ isValid: true });
      expect(validatePassword('Another1!')).toEqual({ isValid: true });
    });
  });

  describe('validateDate', () => {
    it('should reject empty date', () => {
      expect(validateDate('')).toEqual({
        isValid: false,
        message: 'Date is required and must contain at least one character',
      });
    });

    it('should enforce YYYY-MM-DD format', () => {
      expect(validateDate('01-01-2000')).toEqual({
        isValid: false,
        message: 'Please enter date in YYYY-MM-DD format',
      });
    });

    it('should reject invalid dates', () => {
      expect(validateDate('2000-13-01')).toEqual({
        isValid: false,
        message: 'Invalid date',
      });
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validateDate(futureDate.toISOString().split('T')[0])).toEqual({
        isValid: false,
        message: 'Date cannot be in the future',
      });
    });

    it('should enforce minimum age (18+)', () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 17);
      expect(validateDate(recentDate.toISOString().split('T')[0])).toEqual({
        isValid: false,
        message: 'You must be at least 18 years old',
      });
    });

    it('should accept valid dates', () => {
      expect(validateDate('1990-01-01')).toEqual({ isValid: true });
      expect(validateDate('1985-12-31')).toEqual({ isValid: true });
    });
  });

  describe('validateStreet', () => {
    it('should reject empty street', () => {
      expect(validateStreet('')).toEqual({
        isValid: false,
        message: 'Street is required and must contain at least one character',
      });
    });

    it('should accept any non-empty string', () => {
      expect(validateStreet('Main St. 123')).toEqual({ isValid: true });
      expect(validateStreet('ул. Ленина, 1')).toEqual({ isValid: true });
    });
  });

  describe('validateCity', () => {
    it('should reject empty city', () => {
      expect(validateCity('')).toEqual({
        isValid: false,
        message: 'City is required',
      });
    });

    it('should reject cities with numbers/symbols', () => {
      expect(validateCity('New York1')).toEqual({
        isValid: false,
        message: 'The field "city" can only contain letters',
      });
    });

    it('should accept valid cities', () => {
      expect(validateCity('Минск')).toEqual({ isValid: true });
      expect(validateCity('San Francisco')).toEqual({ isValid: true });
    });
  });

  describe('validatePostalCode', () => {
    it('should reject empty postal code', () => {
      expect(validatePostalCode('', Country.US)).toEqual({
        isValid: false,
        message: 'Postal Code is required',
      });
    });

    it('should reject postal codes with leading/trailing spaces', () => {
      expect(validatePostalCode(' 12345 ', Country.US)).toEqual({
        isValid: false,
        message: 'Postal Code should not contain leading or trailing spaces',
      });
    });

    it('should validate country-specific formats', () => {
      // Belarus
      expect(validatePostalCode('123456', Country.BY)).toEqual({ isValid: true });
      expect(validatePostalCode('12345', Country.BY)).toEqual({
        isValid: false,
        message: 'Enter 6 digits (example: 123456)',
      });

      // Russia
      expect(validatePostalCode('220000', Country.RU)).toEqual({ isValid: true });
      expect(validatePostalCode('2200', Country.RU)).toEqual({
        isValid: false,
        message: 'Enter 6 digits (example: 220000)',
      });

      // Ukraine
      expect(validatePostalCode('12345', Country.UA)).toEqual({ isValid: true });
      expect(validatePostalCode('1234', Country.UA)).toEqual({
        isValid: false,
        message: 'Enter 5 digits (example: 12345)',
      });

      // USA
      expect(validatePostalCode('12345', Country.US)).toEqual({ isValid: true });
      expect(validatePostalCode('12345-6789', Country.US)).toEqual({ isValid: true });
      expect(validatePostalCode('1234', Country.US)).toEqual({
        isValid: false,
        message: 'Enter 5 digits or 5+4 digits (for example: 12345 or 12345-6789)',
      });
    });
  });
});
