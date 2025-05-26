import React from 'react';
import './ImageModal.css';

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, altText, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <img src={imageUrl} alt={altText} className="modal-image" />
      </div>
    </div>
  );
};

export default ImageModal;
