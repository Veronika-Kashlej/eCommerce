import React, { useState, useEffect } from 'react';
import { Address, EditFormProps, User } from '@/types/interfaces';
import {
  validateDate,
  validateEmail,
  validateFirstName,
  validateLastName,
  //validatePassword,
} from '@/utils/validations';
import { Country, CountryLabels } from '@/types/enums';

const EditForm = <T extends User | Address>({ mode, data, onChange, onSave }: EditFormProps<T>) => {
  const [formData, setFormData] = useState<T>(data);
  //const [emailError, setEmailError] = useState<string>('');
  //const [firstNameError, setFirstNameError] = useState<string>('');
  //const [lastNameError, setLastNameError] = useState<string>('');
  //const [dateError, setDateError] = useState<string>('');
  //const [passError, setPassError] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
  });

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    if (name === 'email') {
      const validation = validateEmail(value);
      setErrors((prev) => ({
        ...prev,
        email: validation.isValid ? '' : (validation.message ?? ''),
      }));
    }
    if (name === 'firstName') {
      const validation = validateFirstName(value);
      setErrors((prev) => ({
        ...prev,
        firstName: validation.isValid ? '' : (validation.message ?? ''),
      }));
    }
    if (name === 'lastName') {
      const validation = validateLastName(value);
      setErrors((prev) => ({
        ...prev,
        lastName: validation.isValid ? '' : (validation.message ?? ''),
      }));
    }
    if (name === 'dateOfBirth') {
      const validation = validateDate(value);
      if (!validation.isValid) {
        setErrors((prev) => ({ ...prev, dateOfBirth: validation.message ?? '' }));
        // } else {
        //   const birth = new Date(value);
        //   const age = new Date().getFullYear() - birth.getFullYear();
        //   if (age < 18) {
        //     setErrors((prev) => ({ ...prev, dateOfBirth: 'You must be at least 18 years old' }));
        //     return;
      } else {
        setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
      }
      // }
    }
    // if (name === 'password') {
    //   const validation = validatePassword(value);
    //   setPassError(validation.isValid ? '' : (validation.message as string));
    // }
    const newData = { ...formData!, [name]: value } as T;
    setFormData(newData);
    onChange(newData);
  };
  const handleSaveClick = () => {
    if (Object.values(errors).some((msg) => msg !== '')) {
      return;
    }
    onSave(mode);
  };

  return (
    <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
      {mode === 'personal' ? (
        <>
          <input
            name="firstName"
            placeholder="Name"
            value={formData!.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <div style={{ color: 'red' }}>{errors.firstName}</div>}
          <input
            name="lastName"
            placeholder="LastName"
            value={formData!.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <div style={{ color: 'red' }}>{errors.lastName}</div>}
          <input
            name="dateOfBirth"
            placeholder="Date of birth"
            type="date"
            value={formData!.dateOfBirth}
            onChange={handleChange}
          />
          {errors.dateOfBirth && <div style={{ color: 'red' }}>{errors.dateOfBirth}</div>}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', color: '#007bff' }}>Change Email (Login):</label>
            <input
              name="email"
              type="email"
              value={formData?.email ?? ''}
              onChange={handleChange}
              style={{
                border: '2px solid #007bff',
                padding: '8px',
                width: '100%',
                marginBottom: '10px',
              }}
            />
            {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
          </div>
        </>
      ) : (
        <>
          <input
            name="streetName"
            placeholder="Street"
            value={(formData as Address).streetName}
            onChange={handleChange}
          />
          <input
            name="city"
            placeholder="City"
            value={(formData as Address).city}
            onChange={handleChange}
          />
          <input
            name="postalCode"
            placeholder="postalCode"
            value={(formData as Address).postalCode}
            onChange={handleChange}
          />
          {/* <input
            name="country"
            placeholder="Country"
            value={(formData as Address).country}
            onChange={handleChange}
          /> */}
          <select
            disabled={true}
            name="country"
            value={(formData as Address).country}
            onChange={(e) => {
              const countryKey = e.target.value as keyof typeof Country;
              setFormData((prev) => {
                const newData = { ...(prev as T), country: countryKey } as T;
                onChange(newData);
                return newData;
              });
            }}
          >
            {Object.keys(CountryLabels).map((key) => (
              <option key={key} value={key}>
                {CountryLabels[key as keyof typeof CountryLabels]}
              </option>
            ))}
          </select>
        </>
      )}
      <button
        className="edit_button"
        disabled={Object.values(errors).some((msg) => msg !== '')}
        onClick={handleSaveClick}
      >
        Save
      </button>
    </div>
  );
};

export default EditForm;
