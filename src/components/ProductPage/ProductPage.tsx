import { useLocation } from 'react-router-dom';
import './ProductPage.css';
import { Attribute } from '@commercetools/platform-sdk';

const ProductPage = () => {
  const { state } = useLocation();
  const product = state?.product;

  if (!product) {
    return <div className="product-not-found">Product not found</div>;
  }

  const { name, description, masterVariant } = product.masterData.current;

  const productName = name['en-US'];
  const productDescription = description?.['en-US'] || 'No description available';
  const images = masterVariant.images || [];
  const attributes = masterVariant.attributes || [];

  return (
    <div className="product-page">
      {images.length > 0 ? (
        <>
          <div className="main-image">
            <img src={images[0].url} alt={productName} className="product-image" />
          </div>
        </>
      ) : (
        <div className="image-placeholder">No Image Available</div>
      )}

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
