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

  return (
    <a className="product-card">
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
      </div>
    </a>
  );
};

export default ProductCard;
