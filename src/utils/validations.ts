import ValidationResult from '../types/interfaces';

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
