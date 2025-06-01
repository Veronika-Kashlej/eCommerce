import React, { useState, useEffect } from 'react';
import { Address, EditFormProps, User } from '@/types/interfaces';
import { validateEmail } from '@/utils/validations';
// import handleSave from './api-edit-form';

const EditForm = <T extends User | Address>({ mode, data, onChange, onSave }: EditFormProps<T>) => {
  const [formData, setFormData] = useState<T>(data);
  const [emailError, setEmailError] = useState<string>('');

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    if (name === 'email') {
      const validation = validateEmail(value);
      setEmailError(validation.isValid ? '' : (validation.message as string));
      // if (!validation.isValid) {
      //   setEmailError(validation.message as string);
      // } else {
      //   setEmailError('');
      // }
    }
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
          <input
            name="lastName"
            placeholder="LastName"
            value={formData!.lastName}
            onChange={handleChange}
          />
          <input
            name="dateOfBirth"
            placeholder="Date of birth"
            type="date"
            value={formData!.dateOfBirth}
            onChange={handleChange}
          />
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', color: '#007bff' }}>Change Password:</label>
            <input
              name="password"
              type="password"
              value={(formData as User)?.password ?? ''}
              onChange={handleChange}
              style={{
                border: '2px solid #007bff',
                padding: '8px',
                width: '100%',
              }}
            />
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
        </>
      )}
      <button className="edit_button" onClick={handleSaveClick}>
        Save
      </button>
    </div>
  );
};

export default EditForm;
