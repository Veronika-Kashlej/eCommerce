import { Country } from '@/types/enums';
import { postalCodePatterns, ValidationResult } from '@/types/interfaces';

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }

  if (email !== email.trim()) {
    return { isValid: false, message: 'Email should not contain leading or trailing spaces' };
  }

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      message: 'Please enter a valid email address (e.g., user@example.com)',
    };
  }

  return { isValid: true };
};

export const validateFirstName = (firstName: string): ValidationResult => {
  if (!firstName.trim()) {
    return { isValid: false, message: 'First Name is required' };
  }

  if (firstName !== firstName.trim()) {
    return { isValid: false, message: 'First Name should not contain leading or trailing spaces' };
  }

  const nameRegex: RegExp = /^[\p{L}]+$/u;
  if (!nameRegex.test(firstName.trim())) {
    return {
      isValid: false,
      message: 'The first name can only contain letters',
    };
  }

  return { isValid: true };
};

export const validateLastName = (lastName: string): ValidationResult => {
  if (!lastName.trim()) {
    return { isValid: false, message: 'Last Name is required' };
  }

  if (lastName !== lastName.trim()) {
    return { isValid: false, message: 'Last Name should not contain leading or trailing spaces' };
  }
  const nameRegex: RegExp = /^[\p{L}]+$/u;
  if (!nameRegex.test(lastName.trim())) {
    return {
      isValid: false,
      message: 'The last name can only contain letters',
    };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password.trim()) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password !== password.trim()) {
    return { isValid: false, message: 'Password should not contain leading or trailing spaces' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true };
};

//Date  TODO

export const validateStreet = (street: string): ValidationResult => {
  if (!street.trim()) {
    return {
      isValid: false,
      message: 'Street is required and must contain at least one character',
    };
  }

  return { isValid: true };
};

export const validateCity = (city: string): ValidationResult => {
  if (!city.trim()) {
    return { isValid: false, message: 'Last Name is required' };
  }

  const cityRegex: RegExp = /^[\p{L}]+$/u;
  if (!cityRegex.test(city.trim())) {
    return {
      isValid: false,
      message: 'The field "city" can only contain letters',
    };
  }

  return { isValid: true };
};

export const validatePostalCode = (postalCode: string, country: Country): ValidationResult => {
  if (!postalCode.trim()) {
    return { isValid: false, message: 'Postal Code is required' };
  }

  if (postalCode !== postalCode.trim()) {
    return { isValid: false, message: 'Postal Code should not contain leading or trailing spaces' };
  }

  const pattern = postalCodePatterns[country];
  if (!pattern.test(postalCode)) {
    let message: string;

    switch (country) {
      case Country.BY:
      case Country.RU:
        message = 'Enter 6 digits (example: 220000)';
        break;
      case Country.UK:
        message = 'Enter 5 digits (example: 12345)';
        break;
      case Country.US:
        message = 'Enter 5 digits or 5+4 digits (for example: 12345 or 12345-6789)';
        break;
      default:
        message = 'Invalid postcode format';
    }
    return { isValid: false, message };
  }

  return { isValid: true };
};

export const validateCountry = (country: string): ValidationResult => {
  const ALL_COUNTRIES = Object.values(Country);

  if (!country.trim()) {
    return { isValid: false, message: 'Postal Code is required' };
  }

  const exactMatch = ALL_COUNTRIES.find(
    (country) => country.toLowerCase() === country.toLowerCase()
  );

  if (exactMatch) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: 'Country not found in the list. Please select from available options.',
  };
};
