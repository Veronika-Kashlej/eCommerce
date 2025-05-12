import { useState } from 'react';
import { validateEmail, validatePassword } from '../../utils/validations';
import './Login.css';
import { ValidationResult } from '@/types/interfaces';
import { Link } from 'react-router-dom';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';
import { modalWindow } from '@/components/modal/modalWindow';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '*required field',
    password: '*required field',
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    // Submit logic here
    try {
      const checkCustomerEmail = await api.getCustomerByEmail(email);
      api.clearTokenCustomer();

      if (!checkCustomerEmail.found) {
        setErrors({ email: checkCustomerEmail.message, password: '' });
      } else {
        const checkCustomer = await api.loginCustomer({ email, password });

        if (checkCustomer.signed) {
          navigate('/');
        } else {
          if (checkCustomer.message === 'Account with the given credentials not found.') {
            setErrors({ email: '', password: 'Customer password incorrect' });
          } else {
            // any other errors
            modalWindow.alert(checkCustomer.message, 'Server notification!');
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="home-link">
        Back to Home
      </Link>
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
          <Link to="/register" className="register-link">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
