import { useState } from 'react';
import { validateEmail, validatePassword } from '../../utils/validations';
import './Registration.css';

function Registration() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    dob: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      const validation = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: validation.isValid ? '' : validation.message || '' }));
    }

    if (name === 'password') {
      const validation = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: validation.isValid ? '' : validation.message || '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.message || '',
        password: passwordValidation.message || '',
      });
      return;
    }

    // Submit logic here
    console.log('Form submitted', formData);
  };

  return (
    <div className="registration-page">
      <form className="root" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <div className="form-group">
          <input
            className={`input ${errors.email ? 'error' : ''}`}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <input
            className="input"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            className="input"
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group password-container">
          <input
            className={`input ${errors.password ? 'error' : ''}`}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
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

        <div className="form-group">
          <label>Date of Birth</label>
          <input
            className="input"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
        </div>

        <h3>Address Information</h3>

        <div className="form-group">
          <input
            className="input"
            type="text"
            name="street"
            placeholder="Street Address"
            value={formData.street}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            className="input"
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            className="input"
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <select className="input" name="country" value={formData.country} onChange={handleChange}>
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>

        <button className="button" type="submit" disabled={!formData.email || !formData.password}>
          Sign Up
        </button>

        <div className="login-prompt">
          <span>Already have an account?</span>
          <a href="/login" className="login-link">
            Log In
          </a>
        </div>
      </form>
    </div>
  );
}

export default Registration;
