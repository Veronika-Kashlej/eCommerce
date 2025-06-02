import React, { useState, useEffect } from 'react';
import { Address, EditFormProps, User } from '@/types/interfaces';
import {
  validateDate,
  validateEmail,
  validateFirstName,
  validateLastName,
  //validatePassword,
} from '@/utils/validations';
//import { Country } from '@/types/enums';

const EditForm = <T extends User | Address>({ mode, data, onChange, onSave }: EditFormProps<T>) => {
  const [formData, setFormData] = useState<T>(data);
  const [emailError, setEmailError] = useState<string>('');
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  //const [passError, setPassError] = useState<string>('');

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    if (name === 'email') {
      const validation = validateEmail(value);
      setEmailError(validation.isValid ? '' : (validation.message as string));
    }
    if (name === 'firstName') {
      const validation = validateFirstName(value);
      setFirstNameError(validation.isValid ? '' : (validation.message as string));
    }
    if (name === 'lastName') {
      const validation = validateLastName(value);
      setLastNameError(validation.isValid ? '' : (validation.message as string));
    }
    if (name === 'dateOfBirth') {
      const validation = validateDate(value);
      setDateError(validation.isValid ? '' : (validation.message as string));
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
    if (emailError) {
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
          {firstNameError && <div style={{ color: 'red' }}>{firstNameError}</div>}
          <input
            name="lastName"
            placeholder="LastName"
            value={formData!.lastName}
            onChange={handleChange}
          />
          {lastNameError && <div style={{ color: 'red' }}>{lastNameError}</div>}
          <input
            name="dateOfBirth"
            placeholder="Date of birth"
            type="date"
            value={formData!.dateOfBirth}
            onChange={handleChange}
          />
          {dateError && <div style={{ color: 'red' }}>{dateError}</div>}
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
            {emailError && <div style={{ color: 'red' }}>{emailError}</div>}
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
          <input
            name="country"
            placeholder="Country"
            value={(formData as Address).country}
            onChange={handleChange}
          />
          {/* <select
            name="country"
            value={(formData as Address).country}
            onChange={(e) => {
              const country = e.target.value as keyof typeof Country;
              setFormData((prev) => (prev ? { ...prev, country } : prev));
            }}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value={Country.EMPTY}>Select Country</option>
            {Object.keys(Country).map((key) => (
              <option key={key} value={key}>
                {Country[key as keyof typeof Country]}
              </option>
            ))}
          </select> */}
        </>
      )}
      <button className="edit_button" onClick={handleSaveClick}>
        Save
      </button>
    </div>
  );
};

export default EditForm;
