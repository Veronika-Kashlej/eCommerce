import React, { useEffect, useState } from 'react';
import EmptyMessage from './EmptyMessage';
import { getCart } from '@/api/cart';
import { LineItem } from '@commercetools/platform-sdk';
import './BasketPage.css';

const BasketPage: React.FC = () => {
  const [isCartEmpty, setIsCartEmpty] = useState(true);
  const [items, setItems] = useState<LineItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        if (response.response) {
          const cartItems = response.response.body.lineItems;
          setItems(cartItems);
          setIsCartEmpty(cartItems.length === 0);

          const total = cartItems.reduce((sum: number, item) => {
            return sum + item.totalPrice.centAmount / 100;
          }, 0);
          setTotalPrice(total);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    fetchCart();
  }, []);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  return (
    <div className="basket-page-container">
      <h1 className="basket-title">Your Shopping Cart</h1>

      {isCartEmpty ? (
        <EmptyMessage />
      ) : (
        <div className="basket-content">
          <div className="items-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.variant.images?.length ? (
                    <img
                      src={item.variant.images[0].url}
                      alt={item.name['en-US']}
                      className="product-image"
                    />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.name['en-US']}</h3>
                  <p className="item-price">
                    {item.price.discounted ? (
                      <>
                        <span className="original-price">
                          {formatPrice(item.price.value.centAmount)}
                        </span>
                        <span className="discounted-price">
                          {formatPrice(item.price.discounted.value.centAmount)}
                        </span>
                      </>
                    ) : (
                      formatPrice(item.price.value.centAmount)
                    )}
                  </p>
                  <div className="item-quantity">Quantity: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>
            <span className="total-price">{formatPrice(totalPrice * 100)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasketPage;
