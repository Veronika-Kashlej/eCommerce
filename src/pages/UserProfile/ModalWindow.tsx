import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWindow: React.FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalWindow;
