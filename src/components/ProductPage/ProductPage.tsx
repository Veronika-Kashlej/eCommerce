import { useLocation } from 'react-router-dom';

const ProductPage = () => {
  const { state } = useLocation();

  if (state?.product) {
    return (
      <div className="product-page">
        <h1>{state.product.masterData.current.name['en-US']}</h1>
      </div>
    );
  }
};
export default ProductPage;
