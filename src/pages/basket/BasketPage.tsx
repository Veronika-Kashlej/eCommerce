import React, { useEffect, useState } from 'react';
import EmptyMessage from './EmptyMessage';
import { clearCart, getCart, removeFromCart } from '@/api/cart';
import { LineItem } from '@commercetools/platform-sdk';
import './BasketPage.css';
import modalWindow from '@/components/modal/ModalWindow';
import { MdDelete } from 'react-icons/md';
import api from '@/api/api';

const BasketPage: React.FC = () => {
  const [isCartEmpty, setIsCartEmpty] = useState(true);
  const [items, setItems] = useState<LineItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  //const [discountPercent, setDiscountPercent] = useState(0);
  // const [originalTotal, setOriginalTotal] = useState(0);
  //const [discountedTotal, setDiscountedTotal] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();
        if (response.response) {
          updateCartState(response.response.body.lineItems);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    fetchCart();
  }, []);

  const updateCartState = (cartItems: LineItem[]) => {
    setItems(cartItems);
    setIsCartEmpty(cartItems.length === 0);

    const total = cartItems.reduce((sum: number, item) => {
      return sum + item.totalPrice.centAmount / 100;
    }, 0);
    setTotalPrice(total);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const handleRemoveItem = async (lineItemId: string) => {
    try {
      setIsRemoving(lineItemId);
      const response = await removeFromCart(lineItemId);
      if (response.response) {
        const updatedItems = items.filter((item) => item.id !== lineItemId);
        setItems(updatedItems);
        setIsCartEmpty(updatedItems.length === 0);

        const removedItem = items.find((item) => item.id === lineItemId);
        if (removedItem) {
          setTotalPrice((prev) => prev - removedItem.totalPrice.centAmount / 100);
        }

        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      modalWindow.alert(`${error}. Please try again.`);
    } finally {
      setIsRemoving(null);
    }
  };
  const handleClearCart = async () => {
    const confirmed = await modalWindow.confirm(
      'Are you sure you want to clear your entire cart?',
      'Clear Shopping Cart'
    );

    if (!confirmed) return;

    try {
      setIsClearing(true);
      const response = await clearCart();

      if (response.success) {
        updateCartState([]);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        modalWindow.alert(response.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      modalWindow.alert('Error clearing cart. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleIncreaseQuantity = async (lineItemId: string, currentQuantity: number) => {
    const result = await api.cartChangeItems(lineItemId, currentQuantity + 1);
    if (result.success && result.response) {
      updateCartState(result.response.body.lineItems);
      //console.log('Обновленная корзина:', result.response);
    } else {
      modalWindow.alert(result.message);
    }
  };

  const handleDecreaseQuantity = async (lineItemId: string, currentQuantity: number) => {
    const newQuantity = currentQuantity > 1 ? currentQuantity - 1 : 0;
    const result = await api.cartChangeItems(lineItemId, newQuantity);
    if (result.success && result.response) {
      updateCartState(result.response.body.lineItems);
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      modalWindow.alert(result.message);
    }
  };

  const handleApplyPromo = async () => {
    const result = await api.discountApply(promoCode);
    if (result.success && result.response) {
      const discountInfo = result.response.body.discount;
      let discountPercent = 0;

      if (discountInfo.type === 'relative') {
        discountPercent = discountInfo.value / 100;
      }

      const total = items.reduce((sum, item) => sum + item.totalPrice.centAmount, 0);
      setOriginalTotal(total);
      const newTotal = total * (1 - discountPercent);
      setDiscountedTotal(newTotal);
      setDiscountPercent(discountPercent);
      setDiscountApplied(true);
    } else {
      alert(result.message);
    }
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

                  <div className="promo-input">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button onClick={handleApplyPromo}>Apply</button>
                  </div>

                  <p className="item-price">
                    {item.price.discounted || discountApplied ? (
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
                  <div className="quantity-controls">
                    <button
                      className="item-quantity-change"
                      onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                      title="Decrease quantity"
                    >
                      {item.quantity > 1 ? '-' : <MdDelete size={15} color="#555" />}{' '}
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="item-quantity-change"
                      onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isRemoving === item.id}
                  >
                    {isRemoving === item.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>
            <span className="total-price">{formatPrice(totalPrice * 100)}</span>
          </div>
          <button className="clear-cart-btn" onClick={handleClearCart} disabled={isClearing}>
            {isClearing ? 'Clearing...' : 'Clear Cart'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BasketPage;
