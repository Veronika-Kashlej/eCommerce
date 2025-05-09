import { useState } from 'react';
import { validateEmail, validatePassword } from '../../utils/validations';
import './Login.css';
import ValidationResult from '@/types/interfaces';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    setEmail(value);
    const validation: ValidationResult = validateEmail(value);
    setErrors((prev) => ({ ...prev, email: validation.isValid ? '' : validation.message || '' }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    setPassword(value);
    const validation: ValidationResult = validatePassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validation.isValid ? '' : validation.message || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation: ValidationResult = validateEmail(email);
    const passwordValidation: ValidationResult = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.message || '',
        password: passwordValidation.message || '',
      });
      return;
    }

    // TODO Submit logic here
    console.log('Form submitted', { email, password });
  };

  return (
    <div className="login-page">
      <form className="root" onSubmit={handleSubmit}>
        <h2>Log In</h2>

        <div className="form-group">
          <input
            className={`input ${errors.email ? 'error' : ''}`}
            type="text"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group password-container">
          <input
            className={`input ${errors.password ? 'error' : ''}`}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <button className="button" type="submit" disabled={!email || !password}>
          Log In
        </button>

        <div className="register-prompt">
          <span>Don't have an account?</span>
          <a href="/register" className="register-link">
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;
