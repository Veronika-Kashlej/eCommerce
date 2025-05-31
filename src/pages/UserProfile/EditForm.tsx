import React, { useState, useEffect } from 'react';
import { Address, EditFormProps, User } from '@/types/interfaces';
// import handleSave from './api-edit-form';

const EditForm = <T extends User | Address>({ mode, data, onChange, onSave }: EditFormProps<T>) => {
  const [formData, setFormData] = useState<T | null>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const newData = { ...formData!, [name]: value } as T;
    setFormData(newData);
    onChange(newData);
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
      <button className="edit_button" onClick={() => onSave(mode)}>
        Save
      </button>
    </div>
  );
};

export default EditForm;
