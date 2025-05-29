import './Products-list.css';
import { useEffect, useState } from 'react';
import api from '@/api/api';
import { Category, ProductProjectionPagedSearchResponse } from '@commercetools/platform-sdk';
import ProductCard from '@/components/ProductCard/ProductCard';
import PaginationControls from '@/components/products-list/PaginationControls';
import { ProductProjectionSearchArgs } from '@/api/interfaces/types';

interface CategoryTree extends Category {
  children?: CategoryTree[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductProjectionPagedSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState<number>(5);

  const limitOptions = [5, 10, 15, 25, 30, 50, 100];

  // const getTopLevelCategories = (categories: Category[]): Category[] => {
  //   return categories.filter(category => !category.parent);
  // };

  const getTopLevelCategories = (categories: Category[]): Category[] => {
    return categories.filter((category) => !category.parent?.obj?.id);
  };

  const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
    const tree: CategoryTree[] = [];
    const mappedCategories: Record<string, CategoryTree> = {};

    categories.forEach((category) => {
      mappedCategories[category.id] = { ...category, children: [] };
    });

    categories.forEach((category) => {
      const parentId = category.parent?.obj?.id;
      if (parentId && mappedCategories[parentId]) {
        mappedCategories[parentId].children?.push(mappedCategories[category.id]);
      } else {
        tree.push(mappedCategories[category.id]);
      }
    });

    return tree;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategories();
        if (response) {
          const topLevelCategories = getTopLevelCategories(response.body.results);
          setCategories(topLevelCategories);
          const tree = buildCategoryTree(response.body.results);
          setCategoryTree(tree);
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const parentCategory = categoryTree.find((cat) => cat.id === selectedCategory);
      setSubcategories(parentCategory?.children || []);
      setSelectedSubcategory('');
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory, categoryTree]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryFilters = [];
        if (selectedCategory) categoryFilters.push(`categories.id:"${selectedCategory}"`);
        if (selectedSubcategory && subcategories.some((sc) => sc.id === selectedSubcategory)) {
          categoryFilters.push(`categories.id:"${selectedSubcategory}"`);
        }

        const params: ProductProjectionSearchArgs = {
          limit,
          offset,
          ...(appliedSearchQuery && { searchTerm: appliedSearchQuery }),
          filter: categoryFilters.length > 0 ? categoryFilters : undefined,
          facet: ['variants.attributes.color', 'variants.attributes.size'],
        };

        const response = await api.getProductsList(params);
        if (response) setProducts(response.body);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [appliedSearchQuery, selectedCategory, selectedSubcategory, subcategories, offset, limit]);

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategory(e.target.value);
    setOffset(0);
  };

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
    setSelectedSubcategory('');
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
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name?.['en-US'] || category.key}
            </option>
          ))}
        </select>

        {selectedCategory && subcategories.length > 0 && (
          <select
            value={selectedSubcategory}
            onChange={handleSubcategoryChange}
            className="subcategory-select"
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name?.['en-US'] || subcategory.key}
              </option>
            ))}
          </select>
        )}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            title="min 2 characters"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={applySearch}
            className="search-button"
            title="min 2 characters"
            disabled={searchQuery.trim().length < 2}
          >
            Search
          </button>
        </div>
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
