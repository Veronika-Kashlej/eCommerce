import React, { useEffect, useState } from 'react';
import EmptyMessage from './EmptyMessage';
import { ProductCardProps } from '@/types/interfaces';
import ProductCard from '@/components/ProductCard/ProductCard';
import api from '@/api/api';
import { Product } from '@commercetools/platform-sdk';

const BasketPage: React.FC = () => {
  const [isCartEmpty, setIsCartEmpty] = useState(true);
  const [items, setItems] = useState<ProductCardProps[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const handleCartStatusChange = (empty: boolean) => {
    setIsCartEmpty(empty);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (api.getApiRoot) {
          const response = await api.getApiRoot.products().get().execute();
          setAllProducts(response.body.results); // предполагается, что это Product[]
          console.log(response.body.results); //проверка списка всех товаров
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Загрузка корзины и преобразование lineItems
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (api.getApiRoot) {
          const response = await api.getApiRoot.me().activeCart().get().execute();
          const lineItems = response.body.lineItems;
          console.log(lineItems);

          const productsMap = new Map<string, Product>();
          allProducts.forEach((prod) => {
            productsMap.set(prod.id, prod);
          });

          // Преобразуем lineItems в ProductCardProps[]
          // const newItems: ProductCardProps[] = lineItems
          //   .map((item) => {
          //     const product = productsMap.get(item.productId);
          //     if (!product) return null; // пропускаем, если не нашли
          //     return {
          //       product: product,
          //     };
          //   })
          //   .filter((x): x is ProductCardProps => x !== null);

          const newItems: ProductCardProps[] = lineItems
            .map((item) => {
              const product = productsMap.get(item.productId);
              if (!product) return null;

              const currentData = product.masterData?.current;
              if (!currentData) return null; // на всякий случай

              return {
                product: {
                  id: product.id,
                  key: product.key,
                  name: currentData.name, // из masterData.current
                  images: product.masterVariant?.images?.map((img) => ({ url: img.url })) || [],
                  price: item.totalPrice.centAmount / 100,
                },
              };
            })
            .filter((x): x is ProductCardProps => x !== null);

          setItems(newItems);
          setIsCartEmpty(newItems.length === 0);
        } else {
          console.error('api.getApiRoot is undefined');
        }
      } catch (error) {
        console.error('Error of receiving cart:', error);
      }
    };

    if (allProducts.length > 0) {
      fetchCart();
    }
  }, [allProducts]);

  return (
    <div className="page-container">
      <EmptyMessage onStatusChange={handleCartStatusChange} />
      {!isCartEmpty ? (
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
