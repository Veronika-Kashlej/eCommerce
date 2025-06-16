import { Cart, ClientResponse } from '@commercetools/platform-sdk';
import api from '../api';

export const removeDiscountCode = async (discountCodeId: string): Promise<ClientResponse<Cart>> => {
  try {
    const cart = await api.cartGet();
    if (!cart.response) throw new Error('Cart not found');

    const response = await (api.getApiRoot || api.getAnonymApiRoot)
      .me()
      .carts()
      .withId({ ID: cart.response.body.id })
      .post({
        body: {
          version: cart.response.body.version,
          actions: [
            {
              action: 'removeDiscountCode',
              discountCode: {
                typeId: 'discount-code',
                id: discountCodeId,
              },
            },
          ],
        },
      })
      .execute();

    await api.notifyCartSubscribers();
    return response;
  } catch (error) {
    console.error('Error removing discount code:', error);
    throw error;
  }
};
