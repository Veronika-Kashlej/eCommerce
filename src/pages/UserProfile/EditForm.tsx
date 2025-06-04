import React, { useState, useEffect } from 'react';
import { Address, EditFormProps, User } from '@/types/interfaces';
import {
  validateDate,
  validateEmail,
  validateFirstName,
  validateLastName,
} from '@/utils/validations';
import { Country, CountryLabels } from '@/types/enums';

const EditForm = <T extends User | Address>({ mode, data, onChange, onSave }: EditFormProps<T>) => {
  const [formData, setFormData] = useState<T>(data);
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
  });
  // const [confirmDialog, setConfirmDialog] = useState<{
  //   message: string;
  //   onConfirm: () => void;
  // } | null>(null);

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
      } else {
        setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
      }
    }
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

  // const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, onConfirm, onCancel }) => (
  //   <div className="modal-backdrop">
  //     <div className="modal-content">
  //       <p>{message}</p>
  //       <button onClick={onConfirm}>Да</button>
  //       <button onClick={onCancel}>Нет</button>
  //     </div>
  //   </div>
  // );

  // const handleDeleteAddress = (addressId: string) => {
  //   setConfirmDialog({
  //     message: 'Вы уверены, что хотите удалить этот адрес?',
  //     onConfirm: () => {
  //       setConfirmDialog(null);
  //       onDeleteAddress?.(addressId);
  //     },
  //   });
  // };

  // const handleSetDefault = (addressId: string, type: 'billing' | 'shipping') => {
  //   setConfirmDialog({
  //     message: `Вы уверены, что хотите назначить этот адрес как ${type}?`,
  //     onConfirm: () => {
  //       setConfirmDialog(null);
  //       onSetDefaultAddress?.(addressId, type);
  //     },
  //   });
  // };

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
      {/* <div>
        {props.onDeleteAddress && (
          <button
            onClick={() => props.onDeleteAddress!(address.id)}
            style={{ marginRight: '10px' }}
          >
            Удалить
          </button>
        )}
        {props.onSetDefaultAddress && (
          <>
            <button
              onClick={() => props.onSetDefaultAddress!(address.id, 'billing')}
              style={{ marginRight: '10px' }}
            >
              Назначить как billing
            </button>
            <button onClick={() => props.onSetDefaultAddress!(address.id, 'shipping')}>
              Назначить как shipping
            </button>
          </>
        )}
      </div> */}
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
