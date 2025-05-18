import { useEffect, useState } from 'react';
import * as validations from '@/utils/validations';
import './Registration.css';
import { ValidationResult, IFormData } from '@/types/interfaces';
import { Country, CountryLabels } from '@/types/enums';
import { Link } from 'react-router-dom';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';
import modalWindow from '@/components/modal/modalWindow';
import WaitingModal from '@/components/waiting/waiting';
import { CustomerDraft } from '@commercetools/platform-sdk';

function Registration() {
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [defaultAddressSettings, setDefaultAddressSettings] = useState({
    shipping: false,
    billing: false,
  });

  const [isWaitingOpen, setIsWaitingOpen] = useState(false);

  const navigate = useNavigate();
  const [formData, setFormData] = useState<IFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    dob: '',
    shippingStreet: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: Country.EMPTY,
    billingStreet: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: Country.EMPTY,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '*required field',
    firstName: '*required field',
    lastName: '*required field',
    password: '*required field',
    dob: '*required field',
    shippingStreet: '*required field',
    shippingCity: '*required field',
    shippingPostalCode: '*required field',
    shippingCountry: '*required field',
    billingStreet: '*required field',
    billingCity: '*required field',
    billingPostalCode: '*required field',
    billingCountry: '*required field',
  });

  useEffect(() => {
    setErrors((prev) => ({
      ...prev,
      shippingCountry: formData.shippingCountry === Country.EMPTY ? '*required field' : '',
      billingCountry: formData.billingCountry === Country.EMPTY ? '*required field' : '',
    }));
  }, [formData.shippingCountry, formData.billingCountry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      //const newFormData = { ...prev, [name]: value };
      const newFormData = { ...prev };

      if (name === 'shippingCountry' || name === 'billingCountry') {
        newFormData[name as 'shippingCountry' | 'billingCountry'] = value as Country;

        if (value === Country.EMPTY) {
          if (name === 'shippingCountry') {
            newFormData.shippingStreet = '';
            newFormData.shippingCity = '';
            newFormData.shippingPostalCode = '';
          } else if (name === 'billingCountry') {
            newFormData.billingStreet = '';
            newFormData.billingCity = '';
            newFormData.billingPostalCode = '';
          }
        }
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          if (name === 'shippingCountry' && value === Country.EMPTY) {
            newErrors.shippingStreet = '*required field';
            newErrors.shippingCity = '*required field';
            newErrors.shippingPostalCode = '*required field';
          }

          if (name === 'billingCountry' && value === Country.EMPTY) {
            newErrors.billingStreet = '*required field';
            newErrors.billingCity = '*required field';
            newErrors.billingPostalCode = '*required field';
          }
          return newErrors;
        });
      } else {
        newFormData[name as Exclude<keyof IFormData, 'shippingCountry' | 'billingCountry'>] = value;
      }

      if (useSameAddress && name.startsWith('shipping')) {
        const billingField = name.replace('shipping', 'billing') as keyof IFormData;

        if (billingField === 'billingCountry') {
          newFormData.billingCountry = value as Country;
        } else {
          newFormData[
            billingField as Exclude<keyof IFormData, 'billingCountry' | 'shippingCountry'>
          ] = value;
        }

        if (errors[name as keyof typeof errors]) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [billingField]: prevErrors[name as keyof typeof errors],
          }));
        }
      }

      if (name === 'shippingCountry' || name === 'shippingPostalCode') {
        const postalCode = name === 'shippingCountry' ? prev.shippingPostalCode : value;
        const country = name === 'shippingCountry' ? value : newFormData.shippingCountry;

        if (postalCode && country !== Country.EMPTY) {
          const validation = validations.validatePostalCode(postalCode, country as Country);
          setErrors((prevErrors) => ({
            ...prevErrors,
            shippingPostalCode: validation.isValid ? '' : validation.message || '',
          }));
        }
      }

      if (name === 'billingCountry' || name === 'billingPostalCode') {
        const postalCode = name === 'billingCountry' ? prev.shippingPostalCode : value;
        const country = name === 'billingCountry' ? value : newFormData.billingCountry;

        if (postalCode && country !== Country.EMPTY) {
          const validation = validations.validatePostalCode(postalCode, country as Country);
          setErrors((prevErrors) => ({
            ...prevErrors,
            billingPostalCode: validation.isValid ? '' : validation.message || '',
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
        shippingStreet: validations.validateStreet,
        shippingCity: validations.validateCity,
        billingStreet: validations.validateStreet,
        billingCity: validations.validateCity,
      };

      if (name in validationMap) {
        const validation = validationMap[name](value);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validation.isValid ? '' : validation.message || '',
        }));

        if (useSameAddress && name.startsWith('shipping')) {
          const billingField = name.replace('shipping', 'billing');
          setErrors((prevErrors) => ({
            ...prevErrors,
            [billingField]: validation.isValid ? '' : validation.message || '',
          }));
        }
      }

      return newFormData;
    });
  };

  const toggleUseSameAddress = () => {
    const newUseSameAddress = !useSameAddress;
    setUseSameAddress(newUseSameAddress);

    if (newUseSameAddress) {
      setFormData((prev) => ({
        ...prev,
        billingStreet: prev.shippingStreet,
        billingCity: prev.shippingCity,
        billingPostalCode: prev.shippingPostalCode,
        billingCountry: prev.shippingCountry,
      }));

      setErrors((prev) => ({
        ...prev,
        billingStreet: prev.shippingStreet,
        billingCity: prev.shippingCity,
        billingPostalCode: prev.shippingPostalCode,
        billingCountry: prev.shippingCountry,
      }));
    }
  };

  // const handleDefaultAddressChange = (type: 'shipping' | 'billing', checked: boolean) => {
  //   setDefaultAddressSettings((prev) => ({
  //     ...prev,
  //     [type]: checked,
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = validations.validateEmail(formData.email);
    const firstNameValidation = validations.validateFirstName(formData.firstName);
    const lastNameValidation = validations.validateLastName(formData.lastName);
    const passwordValidation = validations.validatePassword(formData.password);
    const dateValidation = validations.validateDate(formData.dob);
    const shippingStreetValidation = validations.validateStreet(formData.shippingStreet);
    const shippingCityValidation = validations.validateCity(formData.shippingCity);
    const shippingPostalCodeValidation = validations.validatePostalCode(
      formData.shippingPostalCode,
      formData.shippingCountry
    );
    const billingStreetValidation = validations.validateStreet(formData.billingStreet);
    const billingCityValidation = validations.validateCity(formData.billingCity);
    const billingPostalCodeValidation = validations.validatePostalCode(
      formData.billingPostalCode,
      formData.billingCountry
    );

    if (
      !emailValidation.isValid ||
      !firstNameValidation.isValid ||
      !lastNameValidation.isValid ||
      !passwordValidation.isValid ||
      !dateValidation.isValid ||
      !shippingStreetValidation.isValid ||
      !shippingCityValidation.isValid ||
      !shippingPostalCodeValidation.isValid ||
      !billingStreetValidation.isValid ||
      !billingCityValidation.isValid ||
      !billingPostalCodeValidation.isValid
    ) {
      setErrors({
        email: emailValidation.message || '',
        firstName: firstNameValidation.message || '',
        lastName: lastNameValidation.message || '',
        password: passwordValidation.message || '',
        dob: dateValidation.message || '',
        shippingStreet: shippingStreetValidation.message || '',
        shippingCity: shippingCityValidation.message || '',
        shippingPostalCode: shippingPostalCodeValidation.message || '',
        shippingCountry: formData.shippingCountry === Country.EMPTY ? '*required field' : '',
        billingStreet: billingStreetValidation.message || '',
        billingCity: billingCityValidation.message || '',
        billingPostalCode: billingPostalCodeValidation.message || '',
        billingCountry: formData.billingCountry === Country.EMPTY ? '*required field' : '',
      });
      return;
    }

    setIsWaitingOpen(true);

    try {
      const shippingCountryEntry = Object.entries(Country).find(
        ([, value]) => value === formData.shippingCountry
      );
      const billingCountryEntry = Object.entries(Country).find(
        ([, value]) => value === formData.billingCountry
      );

      if (!shippingCountryEntry || !billingCountryEntry) {
        throw new Error('Invalid country selected');
      }

      const shippingCountryCode = shippingCountryEntry[0];
      const billingCountryCode = billingCountryEntry[0];

      const addresses = [
        {
          streetName: formData.shippingStreet,
          city: formData.shippingCity,
          postalCode: formData.shippingPostalCode,
          country: shippingCountryCode,
        },
      ];

      if (!useSameAddress) {
        addresses.push({
          streetName: formData.billingStreet,
          city: formData.billingCity,
          postalCode: formData.billingPostalCode,
          country: billingCountryCode,
        });
      }

      if (useSameAddress) {
        addresses.push({
          streetName: formData.shippingStreet,
          city: formData.shippingCity,
          postalCode: formData.shippingPostalCode,
          country: shippingCountryCode,
        });
      }

      const userData: CustomerDraft = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob,
        addresses,
        shippingAddresses: [0],
        //billingAddresses: useSameAddress ? [0] : [1],
        billingAddresses: [1],
        defaultShippingAddress: defaultAddressSettings.shipping ? 0 : undefined,
        defaultBillingAddress: defaultAddressSettings.billing ? 1 : undefined,
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
                  shippingCountry: 'Expected one: BY, RU, UA, US',
                  billingCountry: 'Expected one: BY, RU, UA, US',
                }));
                break;

              default:
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
        <fieldset>
          <h3>Shipping Address</h3>

          <div className="form-group">
            <select
              className={`input ${errors.shippingCountry ? 'error' : ''}`}
              name="shippingCountry"
              value={formData.shippingCountry}
              onChange={handleChange}
            >
              <option value={Country.EMPTY}>Select Country</option>
              {Object.values(Country)
                .filter((v) => v !== Country.EMPTY)
                .map((value) => (
                  <option key={value} value={value}>
                    {CountryLabels[value]}
                  </option>
                ))}
            </select>
            {errors.shippingCountry && (
              <span className="error-message">{errors.shippingCountry}</span>
            )}
          </div>

          <div className="form-group">
            <input
              className={`input ${errors.shippingStreet ? 'error' : ''}`}
              type="text"
              name="shippingStreet"
              placeholder="Street Address"
              value={formData.shippingStreet}
              onChange={handleChange}
              disabled={formData.shippingCountry === Country.EMPTY}
            />
            {errors.shippingStreet && (
              <span className="error-message">{errors.shippingStreet}</span>
            )}
          </div>

          <div className="form-group">
            <input
              className={`input ${errors.shippingCity ? 'error' : ''}`}
              type="text"
              name="shippingCity"
              placeholder="City"
              value={formData.shippingCity}
              onChange={handleChange}
              disabled={formData.shippingCountry === Country.EMPTY}
            />
            {errors.shippingCity && <span className="error-message">{errors.shippingCity}</span>}
          </div>

          <div className="form-group">
            <input
              className={`input ${errors.shippingPostalCode ? 'error' : ''}`}
              type="text"
              name="shippingPostalCode"
              placeholder="Postal Code"
              value={formData.shippingPostalCode}
              onChange={handleChange}
              disabled={formData.shippingCountry === Country.EMPTY}
            />
            {errors.shippingPostalCode && (
              <span className="error-message">{errors.shippingPostalCode}</span>
            )}
          </div>
        </fieldset>

        <div className="default-address-options">
          <label className="default-address-label">
            <input
              type="checkbox"
              checked={defaultAddressSettings.shipping}
              onChange={(e) =>
                setDefaultAddressSettings((prev) => ({
                  ...prev,
                  shipping: e.target.checked,
                }))
              }
            />
            Set as default shipping address
          </label>
        </div>

        <div className="same-address-checkbox">
          <label>
            <input type="checkbox" checked={useSameAddress} onChange={toggleUseSameAddress} />
            Use the same address for billing
          </label>
        </div>

        {!useSameAddress && (
          <fieldset>
            <h3>Billing Address</h3>

            <div className="form-group">
              <select
                className={`input ${errors.billingCountry ? 'error' : ''}`}
                name="billingCountry"
                value={formData.billingCountry}
                onChange={handleChange}
              >
                <option value={Country.EMPTY}>Select Country</option>
                {Object.values(Country)
                  .filter((v) => v !== Country.EMPTY)
                  .map((value) => (
                    <option key={value} value={value}>
                      {CountryLabels[value]}
                    </option>
                  ))}
              </select>
              {errors.billingCountry && (
                <span className="error-message">{errors.billingCountry}</span>
              )}
            </div>

            <div className="form-group">
              <input
                className={`input ${errors.billingStreet ? 'error' : ''}`}
                type="text"
                name="billingStreet"
                placeholder="Street Address"
                value={formData.billingStreet}
                onChange={handleChange}
                disabled={formData.billingCountry === Country.EMPTY}
              />
              {errors.billingStreet && (
                <span className="error-message">{errors.billingStreet}</span>
              )}
            </div>

            <div className="form-group">
              <input
                className={`input ${errors.billingCity ? 'error' : ''}`}
                type="text"
                name="billingCity"
                placeholder="City"
                value={formData.billingCity}
                onChange={handleChange}
                disabled={formData.billingCountry === Country.EMPTY}
              />
              {errors.billingCity && <span className="error-message">{errors.billingCity}</span>}
            </div>

            <div className="form-group">
              <input
                className={`input ${errors.billingPostalCode ? 'error' : ''}`}
                type="text"
                name="billingPostalCode"
                placeholder="Postal Code"
                value={formData.billingPostalCode}
                onChange={handleChange}
                disabled={formData.billingCountry === Country.EMPTY}
              />
              {errors.billingPostalCode && (
                <span className="error-message">{errors.billingPostalCode}</span>
              )}
            </div>
          </fieldset>
        )}

        <div className="default-address-options">
          {/* <label className="default-address-label">
            <input
              type="checkbox"
              checked={defaultAddressSettings.shipping}
              onChange={(e) =>
                setDefaultAddressSettings((prev) => ({
                  ...prev,
                  shipping: e.target.checked,
                }))
              }
            />
            Set as default shipping address
          </label> */}

          <label className="default-address-label">
            <input
              type="checkbox"
              checked={defaultAddressSettings.billing}
              onChange={(e) =>
                setDefaultAddressSettings((prev) => ({
                  ...prev,
                  billing: e.target.checked,
                }))
              }
            />
            Set as default billing address
          </label>
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
