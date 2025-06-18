import React, { useState, useEffect } from 'react';
import './FilterModal.css';
import api from '@/api/api';
import { FacetResults } from '@commercetools/platform-sdk';

interface CachedFacets {
  colors: string[];
  finish: string[];
  minPrice: number;
  maxPrice: number;
  timestamp: number;
}

interface SavedFilters {
  priceRange: [number, number];
  colors: string[];
  finish: string[];
  timestamp: number;
}

const CACHE_EXPIRY_TIME = 15 * 60 * 1000;
const FILTERS_STORAGE_KEY = 'productFilters';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { priceRange: [number, number]; colors: string[]; finish: string[] }) => void;
  // onReset: () => void;
  currentFilters: {
    priceRange: [number, number];
    colors: string[];
    finish: string[];
  };
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  // onReset,
  currentFilters,
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>(currentFilters.priceRange);
  const [selectedColors, setSelectedColors] = useState<string[]>(currentFilters.colors);
  const [selectedFinish, setSelectedFinish] = useState<string[]>(currentFilters.finish);
  const [availableAttributes, setAvailableAttributes] = useState<{
    colors: string[];
    finish: string[];
    minPrice: number;
    maxPrice: number;
  }>({
    colors: [],
    finish: [],
    minPrice: 0,
    maxPrice: 10000,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        await fetchAvailableAttributes();
        await loadSavedFilters();
      };
      loadData();
    }
  }, [isOpen]);

  const loadSavedFilters = async () => {
    const savedData = await localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData: SavedFilters = JSON.parse(savedData);
        if (Date.now() - parsedData.timestamp < CACHE_EXPIRY_TIME) {
          setPriceRange(parsedData.priceRange);
          setSelectedColors(parsedData.colors);
          setSelectedFinish(parsedData.finish);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
    // setPriceRange(currentFilters.priceRange);
    // setSelectedColors(currentFilters.colors);
    // setSelectedFinish(currentFilters.finish);
  };

  const saveFilters = () => {
    const filtersToSave: SavedFilters = {
      priceRange,
      colors: selectedColors,
      finish: selectedFinish,
      timestamp: Date.now(),
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
  };

  // const clearSavedFilters = () => {
  //   localStorage.removeItem(FILTERS_STORAGE_KEY);
  // };

  const fetchAvailableAttributes = async () => {
    const cachedData = getCachedFacets();
    if (cachedData) {
      setAvailableAttributes({
        colors: cachedData.colors,
        finish: cachedData.finish,
        minPrice: cachedData.minPrice,
        maxPrice: cachedData.maxPrice,
      });

      if (
        priceRange[0] !== availableAttributes.minPrice ||
        priceRange[1] !== availableAttributes.maxPrice
      ) {
        setPriceRange([availableAttributes.minPrice, availableAttributes.maxPrice]);
      }

      return;
    }

    setIsLoading(true);

    try {
      const response = await api.getProductsList({
        limit: 1,
        facet: [
          'variants.attributes.color.en-US',
          'variants.attributes.finish.en-US',
          'variants.prices.value.centAmount:range(0 to 1000000)',
        ],
      });

      if (response) {
        const facets: FacetResults | undefined = response.body.facets || {};

        console.log('facets = ', facets);

        const newAttributes = {
          colors:
            'terms' in facets['variants.attributes.color.en-US']
              ? facets['variants.attributes.color.en-US'].terms.map((t) => t.term)
              : [],
          finish:
            'terms' in facets['variants.attributes.finish.en-US']
              ? facets['variants.attributes.finish.en-US'].terms.map((t) => t.term)
              : [],
          minPrice:
            'ranges' in facets['variants.prices.value.centAmount']
              ? facets['variants.prices.value.centAmount'].ranges[0]?.min / 100 || 0
              : 0,
          maxPrice:
            'ranges' in facets['variants.prices.value.centAmount']
              ? facets['variants.prices.value.centAmount'].ranges[0]?.max / 100 || 100
              : 100,
        };

        setAvailableAttributes(newAttributes);
        cacheFacets(newAttributes);

        if (
          !priceRange[0] ||
          !priceRange[1] ||
          priceRange[0] !== newAttributes.minPrice ||
          priceRange[1] !== newAttributes.maxPrice
        ) {
          setPriceRange([newAttributes.minPrice, newAttributes.maxPrice]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch attributes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCachedFacets = (): CachedFacets | null => {
    const cachedData = localStorage.getItem('filterFacetsCache');
    if (!cachedData) return null;

    try {
      const parsedData: CachedFacets = JSON.parse(cachedData);
      if (Date.now() - parsedData.timestamp < CACHE_EXPIRY_TIME) {
        return parsedData;
      }
    } catch (e) {
      console.error('Failed to parse cached facets', e);
    }
    return null;
  };

  const cacheFacets = (data: Omit<CachedFacets, 'timestamp'>) => {
    const dataToCache: CachedFacets = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem('filterFacetsCache', JSON.stringify(dataToCache));
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedFinish((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const handleApply = () => {
    saveFilters();
    onApply({
      priceRange,
      colors: selectedColors,
      finish: selectedFinish,
    });
    onClose();
  };

  const handleReset = () => {
    // clearSavedFilters();
    setSelectedColors([]);
    setSelectedFinish([]);
    setPriceRange([availableAttributes.minPrice, availableAttributes.maxPrice]);
    // onReset();
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="filter-modal-close-btn" onClick={onClose} aria-label="Close filters">
          &times;
        </button>

        <h2 className="filter-modal-title">Product Filters</h2>

        {isLoading ? (
          <div className="filter-loading">Loading filters...</div>
        ) : (
          <div>
            <div className="filter-section">
              <h3 className="filter-subtitle">Price Range</h3>
              <div className="price-range-container">
                <div className="price-inputs">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(Number(e.target.value), priceRange[1])}
                    min={availableAttributes.minPrice}
                    max={availableAttributes.maxPrice}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(priceRange[0], Number(e.target.value))}
                    min={availableAttributes.minPrice}
                    max={availableAttributes.maxPrice}
                  />
                  <span>€</span>
                </div>
                <input
                  type="range"
                  min={availableAttributes.minPrice}
                  max={availableAttributes.maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), priceRange[1])}
                  className="price-slider"
                />
                <input
                  type="range"
                  min={availableAttributes.minPrice}
                  max={availableAttributes.maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(priceRange[0], Number(e.target.value))}
                  className="price-slider"
                />
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-subtitle">Colors</h3>
              <div className="filter-options">
                {availableAttributes.colors.map((color) => {
                  const [colorName, colorCode] = color.split(':');
                  const hexColor = colorCode || '#CCCCCC';

                  return (
                    <label key={color} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => handleColorToggle(color)}
                      />
                      <span
                        className="color-swatch"
                        style={{
                          backgroundColor: hexColor,
                          border: hexColor === '#FFFFFF' ? '1px solid #ddd' : 'none',
                        }}
                        title={colorName}
                      >
                        {colorName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-subtitle">Finish Color</h3>
              <div className="filter-options">
                {(availableAttributes.finish || []).map((finish) => {
                  if (!finish) return null;

                  const [finishName, finishCode] = finish.split(':');
                  const hexColor = finishCode || '#CCCCCC';

                  return (
                    <label key={finish} className="filter-option">
                      <input
                        type="checkbox"
                        checked={(selectedFinish || []).includes(finish)}
                        onChange={() => handleSizeToggle(finish)}
                        aria-label={`Select ${finishName} finish`}
                      />
                      <span
                        className="color-swatch"
                        style={{
                          backgroundColor: hexColor,
                          border: hexColor === '#FFFFFF' ? '1px solid #ddd' : 'none',
                        }}
                        title={finishName}
                      >
                        {finishName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="filter-modal-actions">
          <button onClick={handleReset} className="filter-reset-btn">
            Reset All
          </button>
          <button onClick={handleApply} className="filter-apply-btn">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
