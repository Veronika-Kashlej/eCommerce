import React, { useState } from 'react';
import EmptyMessage from './EmptyMessage';
import { ProductCardProps } from '@/types/interfaces';
import ProductCard from '@/components/ProductCard/ProductCard';

const BasketPage: React.FC = () => {
  const [isCartEmpty, setIsCartEmpty] = useState(true);

  const handleCartStatusChange = (empty: boolean) => {
    setIsCartEmpty(empty);
  };

  const items: ProductCardProps[] = []; // тут надо заполнить товарами которые должны быть в корзине

  return (
    <div className="page-container">
      <EmptyMessage onStatusChange={handleCartStatusChange} />
      {!isCartEmpty ? ( // тут код списка товаров
        <div className="product-list">
          {items.map((item, index) => (
            <ProductCard key={item.product.key ?? index} {...item} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default BasketPage;
