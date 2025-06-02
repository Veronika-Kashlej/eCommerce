import './Products-list.css';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import api from '@/api/api';
import { Category, ProductProjectionPagedSearchResponse } from '@commercetools/platform-sdk';
import ProductCard from '@/components/ProductCard/ProductCard';
import PaginationControls from '@/components/products-list/PaginationControls';
import { ProductProjectionSearchArgs } from '@/api/interfaces/types';

import SortingControls from '@/components/products-list/SortingControls';
import { SortState } from '@/types/interfaces';
import FilterModal from '@/components/products-list/FilterModal';

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

type SortField = 'price' | 'name';

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 10000] as [number, number],
    colors: [] as string[],
    finish: [] as string[],
  });

  const [sort, setSort] = useState<SortState>({
    price: '',
    name: '',
    combined: false,
  });

  const [sortHistory, setSortHistory] = useState<SortField[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState<number>(5);

  const limitOptions = [5, 10, 15, 25, 30, 50, 100];

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  const handleApplyFilters = (filters: {
    priceRange: [number, number];
    colors: string[];
    finish: string[];
  }) => {
    setActiveFilters(filters);
    setOffset(0);
  };

  // const handleResetFilters = () => {
  //   setActiveFilters({
  //     priceRange: [0, 10000],
  //     colors: [],
  //     finish: [],
  //   });
  //   setOffset(0);
  // };

  const updateSortHistory = (field: SortField) => {
    setSortHistory((prev) => {
      const newHistory = [...prev, field];
      return newHistory
        .slice(-2)
        .filter((item): item is SortField => item === 'price' || item === 'name');
    });
  };

  const handlePriceSort = (combined: boolean) => {
    updateSortHistory('price');
    setSort((prev) => {
      if (combined && prev.name) {
        return {
          ...prev,
          price: prev.price === 'asc' ? 'desc' : 'asc',
          combined: true,
        };
      }
      return {
        ...prev,
        price: prev.price === 'asc' ? 'desc' : 'asc',
        name: combined ? prev.name : '',
        combined,
      };
    });
    setOffset(0);
  };

  const handleNameSort = (combined: boolean) => {
    updateSortHistory('name');
    setSort((prev) => {
      if (combined && prev.price) {
        return {
          ...prev,
          name: prev.name === 'asc' ? 'desc' : 'asc',
          combined: true,
        };
      }
      return {
        ...prev,
        name: prev.name === 'asc' ? 'desc' : 'asc',
        price: combined ? prev.price : '',
        combined,
      };
    });
    setOffset(0);
  };

  const toggleCombinedSort = () => {
    setSort((prev) => {
      const newCombined = !prev.combined;

      if (prev.combined && !newCombined && prev.price && prev.name) {
        const lastSort = sortHistory[sortHistory.length - 1] || 'price';
        return lastSort === 'price'
          ? { ...prev, name: '', combined: newCombined }
          : { ...prev, price: '', combined: newCombined };
      }

      return { ...prev, combined: newCombined };
    });
    setOffset(0);
  };

  const resetSorting = () => {
    setSort({ price: '', name: '', combined: false });
    setOffset(0);
  };

  const handleBreadcrumbSelect = (categoryId: string) => {
    if (categoryId === '') {
      setSelectedCategory('');
      setSelectedSubcategory('');
    } else {
      const isSubcategory = subcategories.some((sc) => sc.id === categoryId);

      if (isSubcategory) {
        setSelectedSubcategory(categoryId);
      } else {
        setSelectedCategory(categoryId);
        setSelectedSubcategory('');
      }
    }
    setOffset(0);
  };

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

        const filterQueries: string[] = [];

        filterQueries.push(
          `variants.price.centAmount:range (${activeFilters.priceRange[0] * 100} to ${activeFilters.priceRange[1] * 100})`
        );

        if (activeFilters.colors.length > 0) {
          filterQueries.push(
            `variants.attributes.color.en-US:"${activeFilters.colors.join('","')}"`
          );
        }

        if (activeFilters.finish.length > 0) {
          filterQueries.push(
            `variants.attributes.finish.en-US:"${activeFilters.finish.join('","')}"`
          );
        }

        const categoryFilters: string[] = [];

        if (selectedCategory) categoryFilters.push(`categories.id:"${selectedCategory}"`);
        if (selectedSubcategory && subcategories.some((sc) => sc.id === selectedSubcategory)) {
          categoryFilters.push(`categories.id:"${selectedSubcategory}"`);
        }

        const sortParams = [];
        if (sort.price && sort.name && sort.combined) {
          sortParams.push(`price ${sort.price}`);
          sortParams.push(`name.en-US ${sort.name}`);
        } else if (sort.price) {
          sortParams.push(`price ${sort.price}`);
        } else if (sort.name) {
          sortParams.push(`name.en-US ${sort.name}`);
        }

        const filter: string[] = [];

        if (categoryFilters.length > 0) filter.push(...categoryFilters);
        if (filterQueries.length > 0) filter.push(...filterQueries);

        // console.log('categoryFilters = ', categoryFilters);
        // console.log('filterQueries = ', filterQueries);
        // console.log('filter = ', filter);

        const params: ProductProjectionSearchArgs = {
          limit,
          offset,
          ...(appliedSearchQuery && { searchTerm: appliedSearchQuery }),
          filter: filter.length > 0 ? filter : undefined,
          ...(sortParams.length > 0 && { sort: sortParams }),
        };

        const response = await api.getProductsList(params);
        // console.log('getProductsList = ', response);

        if (response) setProducts(response.body);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    appliedSearchQuery,
    selectedCategory,
    selectedSubcategory,
    subcategories,
    offset,
    limit,
    sort,
    activeFilters,
  ]);

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
      <Breadcrumbs
        categoryTree={categoryTree}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onCategorySelect={handleBreadcrumbSelect}
      />

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
            title="min 3 characters"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={applySearch}
            className="search-button"
            title="min 3 characters"
            disabled={searchQuery.trim().length < 3}
          >
            Search
          </button>
        </div>

        <SortingControls
          sort={sort}
          onPriceSort={handlePriceSort}
          onNameSort={handleNameSort}
          onReset={resetSorting}
          onToggleCombined={toggleCombinedSort}
        />

        <button onClick={openFilterModal} className="filter-button">
          Filters
        </button>
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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        onApply={handleApplyFilters}
        // onReset={handleResetFilters}
        currentFilters={activeFilters}
      />
    </section>
  );
};

export default ProductList;
