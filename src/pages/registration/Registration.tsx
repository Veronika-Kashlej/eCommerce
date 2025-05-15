import { useState } from 'react';
import * as validations from '@/utils/validations';
import './Registration.css';
import { ValidationResult, IFormData } from '@/types/interfaces';
import { Country, CountryLabels } from '@/types/enums';
import { Link } from 'react-router-dom';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';
import modalWindow from '@/components/modal/modalWindow';
import WaitingModal from '@/components/waiting/waiting';

function Registration() {
  const [isWaitingOpen, setIsWaitingOpen] = useState(false);

  const navigate = useNavigate();
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
    email: '*required field',
    firstName: '*required field',
    lastName: '*required field',
    password: '*required field',
    dob: '*required field',
    street: '*required field',
    city: '*required field',
    postalCode: '*required field',
    country: '*required field',
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      !streetValidation.isValid ||
      !cityValidation.isValid ||
      !postalCodeValidation.isValid
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
        country: '', //todo add countryCodeValidation
      });
      return;
    }

    // Submit logic here
    setIsWaitingOpen(true);

    try {
      const countryEntry = Object.entries(Country).find(([, value]) => value === formData.country);

      if (!countryEntry) {
        throw new Error('Invalid country selected');
      }

      const countryCode = countryEntry[0];

      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob,
        addresses: [
          {
            streetName: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            country: countryCode,
          },
        ],
      };

      const registrationResult = await api.registerCustomer(userData);

      if (!registrationResult.registered) {
        api.clearTokenCustomer();

        if (Array.isArray(registrationResult.message)) {
          registrationResult.message.forEach((element) => {
            console.log('registration error = ', element);

            switch (element.code) {
              case 'DuplicateField':
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  email: element.message,
                }));
                break;

              case 'InvalidOperation':
                if (element.detailedErrorMessage === "'password' should not be empty.")
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    password: element.message,
                  }));
                if (element.detailedErrorMessage === 'The provided value is not a valid email')
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: element.message,
                  }));
                break;

              case 'dateOfBirth':
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  dob: element.detailedErrorMessage,
                }));
                break;

              case 'addresses -> country':
                console.log('registration error = ', element.code, ' - ', element.message);
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  country: 'Expected one: BY, RU, UA, US',
                }));
                break;

              default:
                // something unexpected
                modalWindow.alert(element.detailedErrorMessage, 'Registration failed');
                break;
            }
          });
        }
      } else {
        const loginResult = await api.loginCustomer({
          email: formData.email,
          password: formData.password,
        });

        if (!loginResult.signed) {
          throw new Error(loginResult.message);
        }

        navigate('/');
      }
    } catch (error) {
      console.log('Registration failed:', error);
      modalWindow.alert(`We didn't expect this error, but it appeared.`, 'Registration failed');
    } finally {
      setIsWaitingOpen(false);
    }
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
            className={`input ${errors.dob ? 'error' : ''}`}
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dob && <span className="error-message">{errors.dob}</span>}
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
          {errors.country && <span className="error-message">{errors.country}</span>}
        </div>

        <button className="button" type="submit" disabled={!formData.email || !formData.password}>
          Sign Up
        </button>

        <div className="login-prompt">
          <span>Already have an account?</span>
          <Link to="/login" className="login-link">
            Log In
          </Link>
        </div>
      </form>

      <WaitingModal isOpen={isWaitingOpen} />
    </div>
  );
}

export default Registration;
