import api from '../api';
import { CartResponse } from '@/types/interfaces';

export const clearCart = async (): Promise<CartResponse> => {
  try {
    const activeCart = api.getApiRoot
      ? await api.getApiRoot.me().activeCart().get().execute()
      : await api.getAnonymApiRoot
          .carts()
          .withId({ ID: localStorage.getItem('anonymousCartId') || '' })
          .get()
          .execute();

    if (!activeCart) {
      return {
        success: true,
        message: 'No active cart found',
      };
    }

    const actions = activeCart.body.lineItems.map((item) => ({
      action: 'removeLineItem' as const,
      lineItemId: item.id,
      quantity: item.quantity,
    }));

    if (api.getApiRoot) {
      const response = await api.getApiRoot
        .me()
        .carts()
        .withId({ ID: activeCart.body.id })
        .post({
          body: {
            version: activeCart.body.version,
            actions,
          },
        })
        .execute();

      await api.notifyCartSubscribers();

      return {
        response,
        success: true,
        message: 'Cart cleared successfully',
      };
    } else {
      const response = await api.getAnonymApiRoot
        .carts()
        .withId({ ID: activeCart.body.id })
        .post({
          body: {
            version: activeCart.body.version,
            actions,
          },
        })
        .execute();

      await api.notifyCartSubscribers();

      return {
        response,
        success: true,
        message: 'Anonymous cart cleared',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to clear cart',
    };
  }
};
