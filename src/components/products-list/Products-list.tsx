import './Products-list.css';
import { useEffect, useState } from 'react';
import api from '@/api/api';
import { ProductProjectionPagedSearchResponse } from '@commercetools/platform-sdk';
import ProductCard from '@/components/ProductCard/ProductCard';
import PaginationControls from '@/components/products-list/PaginationControls';
import { ProductProjectionSearchArgs } from '@/api/interfaces/types';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductProjectionPagedSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState<number>(5);

  const limitOptions = [5, 10, 15, 25, 30, 50, 100];
  const categories = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Clothing' },
    { id: '3', name: 'Books' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: ProductProjectionSearchArgs = {
          limit,
          offset,
          ...(appliedSearchQuery && { searchTerm: appliedSearchQuery }),
          filter: selectedCategory ? [`categories.id:"${selectedCategory}"`] : undefined,
          facet: ['variants.attributes.color', 'variants.attributes.size'],
        };

        const response = await api.getProductsList(params);

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
  }, [appliedSearchQuery, selectedCategory, offset, limit]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  };

  const applySearch = () => {
    setAppliedSearchQuery(searchQuery);
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
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <button onClick={applySearch} className="search-button">
            Search
          </button>
        </div>

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
