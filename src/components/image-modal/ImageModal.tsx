import React from 'react';
import './ImageModal.css';
import { ProductImage } from '@/types/interfaces';
import Slider from 'react-slick';

interface ImageModalProps {
  images: ProductImage[];
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ images, onClose }) => {
  const sliderSettings = {
    dots: images.length > 1,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: images.length > 1,
    dotsClass: images.length > 1 ? 'slick-dots' : 'slick-dots-hidden',
    adaptiveHeight: true,
    swipe: true,
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="product-slider">
          <Slider {...sliderSettings}>
            {images.map((image: ProductImage, index: number) => (
              <div key={index} className="slider-image-container">
                <img src={image.url} className="product-image" />
              </div>
            ))}
          </Slider>
        </div>{' '}
      </div>
    </div>
  );
};

export default ImageModal;
