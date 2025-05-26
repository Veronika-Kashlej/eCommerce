import './Products-list.css';
import { useEffect, useState } from 'react';
import api from '@/api/api';
import { ProductPagedQueryResponse } from '@commercetools/platform-sdk';
import ProductCard from '@/components/ProductCard/ProductCard';
import PaginationControls from '@/components/products-list/PaginationControls';
import { ProductsQueryArgs } from '@/api/api-interfaces';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductPagedQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState<number>(5);

  const limitOptions = [5, 10, 15, 25, 30, 50, 100];
  const categories = [
    { id: '1', name: 'Electronics' }, // todo change to real
    { id: '2', name: 'Clothing' },
    { id: '3', name: 'Books' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: ProductsQueryArgs = {
          limit,
          offset,
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategory && { category: selectedCategory }),
        };

        const response = await api.getProductsList(params);
        console.log('params = ', params);
        console.log('response = ', response);

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
  }, [searchQuery, selectedCategory, offset, limit]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setOffset(0);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setOffset(0);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0);
  };

  const handlePrevPage = () => {
    if (offset >= limit) setOffset(offset - limit);
  };

  const handleNextPage = () => {
    if (products && products.results.length === limit) setOffset(offset + limit);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <section className="product-list-container">
      <h2>Product List</h2>

      <div className="product-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <PaginationControls
        offset={offset}
        limit={limit}
        totalItems={products?.total}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
        onLimitChange={handleLimitChange}
        limitOptions={limitOptions}
      />

      <div className="product-list">
        {products?.results.length ? (
          products.results.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p>No products found</p>
        )}
      </div>

      <PaginationControls
        offset={offset}
        limit={limit}
        totalItems={products?.total}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
        onLimitChange={handleLimitChange}
        limitOptions={limitOptions}
      />
    </section>
  );
};

export default ProductList;
