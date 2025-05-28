import React, { useState, useEffect } from 'react';
import { Address, EditFormProps, User } from '@/types/interfaces';

const EditForm = <T extends User | Address>({ mode, data, onChange, onSave }: EditFormProps<T>) => {
  const [formData, setFormData] = useState<T | null>(data);
  // const [userData, setUserData] = useState<User | null>(null);
  // const [editAddress, setEditAddress] = useState<Address | null>(null);
  // const [modalMode, setModalMode] = useState<'personal' | 'address'>('personal');
  // const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    //setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // setFormData((prev) => {
    //   if (prev === null) return prev;
    //   return { ...prev, [name]: value };
    // });
    // onChange({ ...formData, [e.target.name]: e.target.value });
    //onChange({ ...formData, [name]: value });
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
            name="dob"
            placeholder="Date of birth"
            type="date"
            value={(formData as User).dob}
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
      <button onClick={onSave}>Save</button>
    </div>
  );
};

export default EditForm;
