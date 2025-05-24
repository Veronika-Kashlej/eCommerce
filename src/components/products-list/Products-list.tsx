import './Products-list.css';
import { useSyncExternalStore, useEffect, useState } from 'react';
import api from '@/api/api';
import { ProductPagedQueryResponse } from '@commercetools/platform-sdk';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductPagedQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = useSyncExternalStore(
    (callback) => {
      api.onLoginStatusChange(callback);
      return () => api.offLoginStatusChange(callback);
    },
    () => api.loginned
  );

  useEffect(() => {
    if (!isLoggedIn) {
      setProducts(null);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getProductsList();
        if (response) {
          setProducts(response.body);
        }
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <section className="product-list-container">
      <h2>Product List</h2>
      <div className="product-list">
        {products?.results.length ? (
          products.results.map((product) => {
            const masterVariant = product.masterData.current.masterVariant;
            const firstImage = masterVariant.images?.[0];

            return (
              <div className="product-list-card" key={product.id}>
                <article>
                  <h3>{product.masterData.current.name['en-US']}</h3>
                  {/* {product.masterData.current.description && (
                    <p>{product.masterData.current.description['en-US']}</p>
                  )} */}
                  {firstImage ? (
                    <img
                      src={firstImage.url}
                      alt={firstImage.label || product.masterData.current.name['en-US']}
                      className="product-image"
                    />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
                </article>
              </div>
            );
          })
        ) : (
          <p>No products found</p>
        )}
      </div>
    </section>
  );
};

export default ProductList;
