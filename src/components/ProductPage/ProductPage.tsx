import { useLocation, useParams } from 'react-router-dom';
import './ProductPage.css';
import { Attribute, Product } from '@commercetools/platform-sdk';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ProductImage } from '@/types/interfaces';
import { useEffect, useState } from 'react';
import api from '@/api/api';
import ImageModal from '../image-modal/ImageModal';

const ProductPage = () => {
  const { productId } = useParams();
  const { state } = useLocation();
  const [product, setProduct] = useState<Product | null>(state?.product || null);
  const [loading, setLoading] = useState(!state?.product);
  const [, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setProduct(null);
    setLoading(true);
    setError(null);
    if (state?.product) {
      setProduct(state.product);
      setLoading(false);
    } else if (productId) {
      const fetchProduct = async () => {
        try {
          const productData = await api.getProductById(productId);
          setProduct(productData);
        } catch (error) {
          console.error('Error fetching product:', error);
          setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId, state?.product]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!product) {
    return <div className="product-not-found">Product not found</div>;
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  const closeModal = () => {
    setSelectedImage(null);
  };

  const { name, description, masterVariant } = product.masterData.current;

  const productName = name['en-US'];
  const productDescription = description?.['en-US'] || 'No description available';
  const images: ProductImage[] =
    masterVariant.images?.map((img: ProductImage) => ({
      url: img.url,
      dimensions: img.dimensions,
      label: img.label,
    })) || [];
  const prices = masterVariant.prices || [];
  const attributes = masterVariant.attributes || [];

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const getPriceInfo = () => {
    if (prices.length === 0) return null;

    const price = prices[0];
    const originalPrice = price.value.centAmount;
    const discountedPrice = price.discounted?.value.centAmount;
    const currency = price.value.currencyCode;

    return {
      original: formatPrice(originalPrice, currency),
      discounted: discountedPrice ? formatPrice(discountedPrice, currency) : null,
      discountPercent: discountedPrice
        ? Math.round((1 - discountedPrice / originalPrice) * 100)
        : 0,
      currency: currency,
    };
  };

  const priceInfo = getPriceInfo();

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

  const modal = selectedImage && <ImageModal images={images} onClose={closeModal} />;
  return (
    <div className="product-page">
      {modal}
      <div className="product-main">
        {images.length > 0 ? (
          <div className="product-slider">
            <Slider {...sliderSettings}>
              {images.map((image: ProductImage, index: number) => (
                <div key={index} className="slider-image-container">
                  <img
                    src={image.url}
                    alt={`${productName} - ${index + 1}`}
                    className="product-image"
                    onClick={() => handleImageClick(image.url)}
                  />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="image-placeholder">No Image Available</div>
        )}
        {priceInfo && (
          <div className="price-section">
            {priceInfo.discounted ? (
              <>
                <span className="original-price">{priceInfo.original}</span>
                <div className="discounted-price-container">
                  <span className="discounted-price">{priceInfo.discounted}</span>
                  <span className="discount-badge">Save {priceInfo.discountPercent}%</span>
                </div>
              </>
            ) : (
              <span className="current-price">{priceInfo.original}</span>
            )}
          </div>
        )}
      </div>

      <div className="product-details">
        <h1 className="product-title">{productName}</h1>
        <div className="product-description">
          <h3>Description</h3>
          <p>{productDescription}</p>
        </div>

        {attributes.length > 0 && (
          <div className="product-attributes">
            <h3>Specifications</h3>
            <ul>
              {attributes.map((attr: Attribute, index: number) => {
                const value = attr.value['en-US'];

                let displayValue = value;
                let colorStyle = {};

                if (attr.name === 'color' || attr.name === 'finish') {
                  const colorName = value.split(':')[0];
                  const colorValue = value.split(':')[1];
                  displayValue = colorName;
                  colorStyle = {
                    backgroundColor: colorValue,
                    width: '20px',
                    height: '20px',
                    display: 'inline-block',
                    marginLeft: '10px',
                    borderRadius: '50%',
                    verticalAlign: 'middle',
                  };
                }

                return (
                  <li key={index}>
                    <strong>{attr.name}:</strong> {displayValue}
                    {(attr.name === 'color' || attr.name === 'finish') && (
                      <span style={colorStyle}></span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="availability">
          {masterVariant.availability?.isOnStock ? (
            <span className="in-stock">
              In Stock ({masterVariant.availability.availableQuantity} available)
            </span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
