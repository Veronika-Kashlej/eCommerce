import React from 'react';
import './SortingControls.css';

import { SortState } from '@/types/interfaces';

interface SortingControlsProps {
  sort: SortState;
  onPriceSort: (combined: boolean) => void;
  onNameSort: (combined: boolean) => void;
  onReset: () => void;
  onToggleCombined: () => void;
}

const SortingControls: React.FC<SortingControlsProps> = ({
  sort,
  onPriceSort,
  onNameSort,
  onReset,
  onToggleCombined,
}) => (
  <fieldset className="sorting-controls">
    <legend>Sorting</legend>

    <div className="sort-buttons">
      <button
        onClick={() => onPriceSort(sort.combined)}
        className={`sort-button ${sort.price ? 'active' : ''}`}
      >
        Price {sort.price === 'asc' ? '↑' : sort.price === 'desc' ? '↓' : ''}
      </button>

      <button
        onClick={() => onNameSort(sort.combined)}
        className={`sort-button ${sort.name ? 'active' : ''}`}
      >
        Name {sort.name === 'asc' ? '↑' : sort.name === 'desc' ? '↓' : ''}
      </button>

      <button onClick={onReset} className="reset-button" disabled={!sort.price && !sort.name}>
        Reset
      </button>

      <label className="combined-sort">
        <input type="checkbox" checked={sort.combined} onChange={onToggleCombined} />
        Combined
      </label>
    </div>
  </fieldset>
);

export default SortingControls;
