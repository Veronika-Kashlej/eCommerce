import React from 'react';
import './Waiting.css';

interface WaitingModalProps {
  isOpen: boolean;
}

const WaitingModal: React.FC<WaitingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="waiting-backdrop">
      <div className="waiting-modal">⏳</div>
    </div>
  );
};

export default WaitingModal;
