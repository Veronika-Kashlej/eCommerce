import React from 'react';

interface PaginationControlsProps {
  offset: number;
  limit: number;
  totalItems?: number;
  onPrev: () => void;
  onNext: () => void;
  onLimitChange: (limit: number) => void;
  limitOptions: number[];
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  offset,
  limit,
  totalItems,
  onPrev,
  onNext,
  onLimitChange,
  limitOptions,
}) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = totalItems ? Math.ceil(totalItems / limit) : 0;
  const isNextDisabled = totalItems !== undefined ? offset + limit >= totalItems : false;

  return (
    <div className="pagination-controls">
      <div className="pagination">
        <button onClick={onPrev} disabled={offset === 0}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={onNext} disabled={isNextDisabled}>
          Next
        </button>
      </div>

      <div className="limit-selector">
        <span>Items per page: </span>
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
          {limitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PaginationControls;
