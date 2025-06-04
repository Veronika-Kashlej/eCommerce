import './Breadcrumbs.css';

import React from 'react';
import { CategoryTree } from './Products-list';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  categoryTree: CategoryTree[];
  selectedCategory: string;
  selectedSubcategory: string;
  onCategorySelect: (id: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  categoryTree,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
}) => {
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({ id: '', name: 'Home' });

    if (selectedCategory) {
      let currentCategory: CategoryTree | undefined;

      const findCategory = (tree: CategoryTree[]): boolean => {
        for (const category of tree) {
          if (category.id === selectedCategory) {
            currentCategory = category;
            return true;
          }
          if (category.children && findCategory(category.children)) {
            breadcrumbs.push({
              id: category.id,
              name: category.name?.['en-US'] || category.key || 'Unnamed Category',
            });
            return true;
          }
        }
        return false;
      };

      findCategory(categoryTree);

      if (currentCategory) {
        breadcrumbs.push({
          id: currentCategory.id,
          name: currentCategory.name?.['en-US'] || currentCategory.key || 'Unnamed Category',
        });

        if (selectedSubcategory) {
          const subcategory = currentCategory.children?.find((c) => c.id === selectedSubcategory);
          if (subcategory) {
            breadcrumbs.push({
              id: subcategory.id,
              name: subcategory.name?.['en-US'] || subcategory.key || 'Unnamed Subcategory',
            });
          }
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.id} className="breadcrumbs-item">
            {index > 0 && <span className="breadcrumbs-separator">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span aria-current="page" className="breadcrumbs-current">
                {crumb.name}
              </span>
            ) : (
              <button onClick={() => onCategorySelect(crumb.id)} className="breadcrumbs-link">
                {crumb.name}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
