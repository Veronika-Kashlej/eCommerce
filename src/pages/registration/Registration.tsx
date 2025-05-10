import { useState } from 'react';
import * as validations from '@/utils/validations';
import './Registration.css';
import { ValidationResult, IFormData } from '@/types/interfaces';
import { Country, CountryLabels } from '@/types/enums';

function Registration() {
  const [formData, setFormData] = useState<IFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    dob: '',
    street: '',
    city: '',
    postalCode: '',
    country: Country.EMPTY,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    dob: '',
    street: '',
    city: '',
    postalCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      if (name === 'country' || name === 'postalCode') {
        const postalCode = name === 'country' ? prev.postalCode : value;
        const country = name === 'country' ? value : newFormData.country;

        if (postalCode && country !== Country.EMPTY) {
          const validation = validations.validatePostalCode(postalCode, country as Country);
          setErrors((prevErrors) => ({
            ...prevErrors,
            postalCode: validation.isValid ? '' : validation.message || '',
          }));
        }
      }

      const validationMap: Record<
        string,
        (value: string, formData?: IFormData) => ValidationResult
      > = {
        email: validations.validateEmail,
        firstName: validations.validateFirstName,
        lastName: validations.validateLastName,
        password: validations.validatePassword,
        dob: validations.validateDate,
        street: validations.validateStreet,
        city: validations.validateCity,
      };

      if (name in validationMap) {
        const validation = validationMap[name](value);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validation.isValid ? '' : validation.message || '',
        }));
      }

      return newFormData;
    });

    // const validationMap: Record<string, (value: string, formData?: IFormData) => ValidationResult> =
    //   {
    //     email: validations.validateEmail,
    //     firstName: validations.validateFirstName,
    //     lastName: validations.validateLastName,
    //     password: validations.validatePassword,
    //     dob: validations.validateDate,
    //     street: validations.validateStreet,
    //     city: validations.validateCity,
    //     postalCode: (value) => validations.validatePostalCode(value, formData.country),
    //   };

    // const validator = validationMap[name];
    // if (validator) {
    //   const validation = validator(value, formData);
    //   setErrors((prev) => ({
    //     ...prev,
    //     [name]: validation.isValid ? '' : validation.message || '',
    //   }));
    // }

    // if (name === 'email') {
    //   const validation: ValidationResult = validations.validateEmail(value);
    //   setErrors((prev) => ({ ...prev, email: validation.isValid ? '' : validation.message || '' }));
    // }

    // if (name === 'firstName') {
    //   const validation = validations.validateFirstName(value);
    //   setErrors((prev) => ({
    //     ...prev,
    //     firstName: validation.isValid ? '' : validation.message || '',
    //   }));
    // }

    // if (name === 'lastName') {
    //   const validation = validations.validateLastName(value);
    //   setErrors((prev) => ({
    //     ...prev,
    //     lastName: validation.isValid ? '' : validation.message || '',
    //   }));
    // }

    // if (name === 'password') {
    //   const validation = validations.validatePassword(value);
    //   setErrors((prev) => ({
    //     ...prev,
    //     password: validation.isValid ? '' : validation.message || '',
    //   }));
    // }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = validations.validateEmail(formData.email);
    const firstNameValidation = validations.validateFirstName(formData.firstName);
    const lastNameValidation = validations.validateLastName(formData.lastName);
    const passwordValidation = validations.validatePassword(formData.password);
    const dateValidation = validations.validateDate(formData.dob);
    const streetValidation = validations.validateStreet(formData.street);
    const cityValidation = validations.validateCity(formData.city);
    const postalCodeValidation = validations.validatePostalCode(
      formData.postalCode,
      formData.country
    );

    if (
      !emailValidation.isValid ||
      !firstNameValidation.isValid ||
      !lastNameValidation.isValid ||
      !passwordValidation.isValid ||
      !dateValidation.isValid ||
      !streetValidation ||
      !cityValidation ||
      !postalCodeValidation
    ) {
      setErrors({
        email: emailValidation.message || '',
        firstName: firstNameValidation.message || '',
        lastName: lastNameValidation.message || '',
        password: passwordValidation.message || '',
        dob: dateValidation.message || '',
        street: streetValidation.message || '',
        city: cityValidation.message || '',
        postalCode: postalCodeValidation.message || '',
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
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <input
            className={`input ${errors.firstName ? 'error' : ''}`}
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <input
            className={`input ${errors.lastName ? 'error' : ''}`}
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
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
            className={`input ${errors.street ? 'error' : ''}`}
            type="text"
            name="street"
            placeholder="Street Address"
            value={formData.street}
            onChange={handleChange}
          />
          {errors.street && <span className="error-message">{errors.street}</span>}
        </div>

        <div className="form-group">
          <input
            className={`input ${errors.city ? 'error' : ''}`}
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <input
            className={`input ${errors.postalCode ? 'error' : ''}`}
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
          />
          {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
        </div>

        <div className="form-group">
          <select className="input" name="country" value={formData.country} onChange={handleChange}>
            <option value={Country.EMPTY}>Select Country</option>
            {Object.values(Country)
              .filter((v) => v !== Country.EMPTY)
              .map((value) => (
                <option key={value} value={value}>
                  {CountryLabels[value]}
                </option>
              ))}
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
