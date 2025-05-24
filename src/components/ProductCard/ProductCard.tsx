import { Product } from '@commercetools/platform-sdk';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const masterVariant = product.masterData.current.masterVariant;
  const firstImage = masterVariant.images?.[0];
  const productName = product.masterData.current.name['en-US'];

  return (
    <div className="product-card">
      <article>
        <h3 className="product-title">{productName}</h3>
        {firstImage ? (
          <img
            src={firstImage.url}
            alt={firstImage.label || productName}
            className="product-image"
          />
        ) : (
          <div className="image-placeholder">No Image</div>
        )}
      </article>
    </div>
  );
};

export default ProductCard;
