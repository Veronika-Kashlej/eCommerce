import { Product } from '@commercetools/platform-sdk';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const masterVariant = product.masterData.current.masterVariant;
  const firstImage = masterVariant.images?.[0];
  const productName = product.masterData.current.name['en-US'];
  const productDescription = product.masterData.current.description?.['en-US'] || '';

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

  return (
    <a className="product-card">
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
      </div>
    </a>
  );
};

export default ProductCard;
