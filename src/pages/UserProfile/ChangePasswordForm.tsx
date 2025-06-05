import api from '@/api/api';
import React, { useState } from 'react';
import ModalWindow from './ModalWindow';
import { ValidationResult } from '@/types/interfaces';
import { validatePassword } from '@/utils/validations';
import { useNavigate } from 'react-router-dom';

const ChangePasswordForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setError('');
    setMessage('');
    const validation: ValidationResult = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.message ?? '');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      if (response.success) {
        setMessage('Password changed successfully');
        await api.logout();
        navigate('/login');
      } else {
        setError('The current password is incorrect or an error');
      }
    } catch {
      setError('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Edit password</h3>
      <input
        name="password"
        className={`input ${error ? 'error' : ''}`}
        type={showPassword ? 'text' : 'password'}
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <input
        name="password"
        className={`input ${error ? 'error' : ''}`}
        type={showPassword ? 'text' : 'password'}
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />

      <input
        name="password"
        className={`input ${error ? 'error' : ''}`}
        type={showPassword ? 'text' : 'password'}
        placeholder="Confirming new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button
        type="button"
        className="password-change-toggle"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? '👁️' : '👁️‍🗨️'}
      </button>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
      <button className="edit_button" onClick={handleChangePassword} disabled={loading}>
        {loading ? 'Saving...' : 'Edit password'}
      </button>

      {successMsg && (
        <ModalWindow onClose={() => setSuccessMsg(null)}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>{successMsg}</p>
            <button
              onClick={() => {
                setSuccessMsg(null);
                onClose();
              }}
            >
              OK
            </button>
          </div>
        </ModalWindow>
      )}
    </div>
  );
};

export default ChangePasswordForm;
