import { Cart, ByProjectKeyRequestBuilder, ClientResponse } from '@commercetools/platform-sdk';
import api from '../api';

export const clearCart = async (
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  anonymApiRoot: ByProjectKeyRequestBuilder,
  loginned: boolean
): Promise<{ response?: ClientResponse<Cart>; success: boolean; message: string }> => {
  try {
    const activeCart = loginned
      ? await apiRoot?.me().activeCart().get().execute()
      : await anonymApiRoot
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

    if (loginned && apiRoot) {
      const response = await apiRoot
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
      const response = await anonymApiRoot
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
