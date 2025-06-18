import { Cart } from '@commercetools/platform-sdk';
import api from '../api';
import { CartDiscountsResponse } from '@/types/interfaces';

export const getCartDiscounts = async (): Promise<CartDiscountsResponse> => {
  try {
    const cartResponse = await api.cartGet();

    if (!cartResponse.response) {
      throw new Error('Cart not found');
    }

    const cart: Cart = cartResponse.response.body;

    return {
      directDiscounts: cart.directDiscounts,
      discountCodes: cart.discountCodes,
      cart: cart,
    };
  } catch (error) {
    console.error('Error fetching cart discounts:', error);
    throw error;
  }
};

export const getCartDiscountsFormatted = (cart: Cart) => {
  if (!cart) return null;

  const directDiscounts =
    cart.directDiscounts?.map((d) => ({
      id: d.id,
      value: d.value,
    })) || [];

  const codeDiscounts =
    cart.discountCodes?.map((dc) => ({
      code: dc.discountCode.obj?.code || 'Unknown',
      id: dc.discountCode.id,
      state: dc.state,
      name: dc.discountCode.obj?.name?.en || 'Discount',
      description: dc.discountCode.obj?.description?.en,
    })) || [];

  const totalDiscount = {
    discountedAmount:
      cart.totalPrice?.centAmount -
      (cart.taxedPrice?.totalNet?.centAmount || cart.totalPrice?.centAmount),
    currency: cart.totalPrice?.currencyCode,
  };

  return {
    directDiscounts,
    codeDiscounts,
    totalDiscount,
    cartVersion: cart.version,
  };
};
