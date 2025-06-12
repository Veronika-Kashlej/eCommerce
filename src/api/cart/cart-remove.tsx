import { MyCartRemoveLineItemAction, MyCartUpdate, CartUpdate } from '@commercetools/platform-sdk';
import api from '../api';
import { CartResponse } from '@/types/interfaces';

export const removeFromCart = async (lineItemId: string): Promise<CartResponse> => {
  try {
    const activeCart = await api.cartGet();
    if (!activeCart.response) {
      return {
        success: false,
        message: 'No active cart found',
      };
    }

    const updateAction: MyCartRemoveLineItemAction = {
      action: 'removeLineItem',
      lineItemId,
    };

    const response = api.getApiRoot
      ? await api.getApiRoot
          .me()
          .carts()
          .withId({ ID: activeCart.response.body.id })
          .post({
            body: {
              version: activeCart.response.body.version,
              actions: [updateAction],
            } as MyCartUpdate,
          })
          .execute()
      : await api.getAnonymApiRoot
          .carts()
          .withId({ ID: activeCart.response.body.id })
          .post({
            body: {
              version: activeCart.response.body.version,
              actions: [updateAction],
            } as CartUpdate,
          })
          .execute();

    return {
      response,
      success: true,
      message: 'Items removed from cart',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    await api.notifyCartSubscribers();
  }
};
