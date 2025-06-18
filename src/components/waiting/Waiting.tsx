import React from 'react';
import './Waiting.css';

interface WaitingModalProps {
  isOpen: boolean;
}

const WaitingModal: React.FC<WaitingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="waiting-backdrop" data-testid="waiting-backdrop">
      <div
        className="waiting-modal"
        data-testid="waiting-modal"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        ⏳
      </div>
    </div>
  );
};

export default WaitingModal;
