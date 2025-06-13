// import { ProductProjection } from '@commercetools/platform-sdk';
import './ProductCard.css';
import { Link } from 'react-router-dom';
import { ProductCardProps } from '@/types/interfaces';
import { useEffect, useState } from 'react';
import { addToCart, checkItemAvailability, getCart } from '@/api/cart';
import api from '@/api/api';

// interface ProductCardProps {
//   product: ProductProjection;
// }

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const masterVariant = product.masterVariant;
  const firstImage = masterVariant.images?.[0];
  const productName = product.name['en-US'];
  const productDescription = product.description?.['en-US'] || '';

  const priceData = masterVariant.prices?.[0];
  const originalPriceCents = priceData?.value?.centAmount;
  const discountedPriceCents = priceData?.discounted?.value?.centAmount;
  const currencyCode = priceData?.value?.currencyCode || 'USD';
  const hasDiscount =
    !!priceData?.discounted &&
    originalPriceCents !== undefined &&
    discountedPriceCents !== undefined;
  const formatPrice = (cents: number | undefined) => {
    if (cents === undefined) return 'Price not available';
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(cents / 100);
  };
  const discountPercentage =
    hasDiscount && originalPriceCents && discountedPriceCents
      ? Math.round((1 - discountedPriceCents / originalPriceCents) * 100)
      : 0;
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const availability = await checkItemAvailability(product.id, 1);
        setAvailabilityMessage(availability.available ? 'Add to cart' : 'Unavailable');

        const cart = await getCart();
        if (cart.response) {
          const isProductInCart = cart.response.body.lineItems.some(
            (item) => item.productId === product.id
          );
          setIsInCart(isProductInCart);
        }
      } catch (error) {
        console.error('Error checking availability or cart:', error);
        setAvailabilityMessage('Error checking availability');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart || availabilityMessage === 'Unavailable') return;

    try {
      setIsLoading(true);
      await addToCart(product.id);
      setIsInCart(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }

    // TODO: удалить эту проверку наличия товара в корзине
    try {
      if (api.getApiRoot) {
        const response = await api.getApiRoot.me().activeCart().get().execute();
        const lineItems = response.body.lineItems;
        console.log('Товары в корзине:', lineItems);
      } else {
        console.error('api.getApiRoot is undefined');
      }
    } catch (error) {
      console.error('Ошибка при получении корзины:', error);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    if (isInCart) return 'In Cart';
    return availabilityMessage || 'Add to Cart';
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card" state={{ product }}>
      {hasDiscount && <div className="discount-badge">-{discountPercentage}%</div>}
      <div className="product-image-container">
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={firstImage.label || productName}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-title">{productName}</h3>
        <p className="product-description">
          {productDescription.substring(0, 100)}
          {productDescription.length > 100 ? '...' : ''}
        </p>
        <div className="price-section">
          {hasDiscount ? (
            <>
              <span className="original-price">{formatPrice(originalPriceCents)}</span>
              <span className="current-price">{formatPrice(discountedPriceCents)}</span>
            </>
          ) : (
            <span className="current-price">{formatPrice(originalPriceCents)}</span>
          )}
        </div>
        <button
          className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''} ${availabilityMessage === 'Unavailable' ? 'unavailable' : ''}`}
          onClick={handleAddToCart}
          disabled={isInCart || availabilityMessage === 'Unavailable'}
        >
          {getButtonText()}{' '}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
