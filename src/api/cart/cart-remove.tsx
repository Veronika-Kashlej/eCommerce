import {
  Cart,
  MyCartRemoveLineItemAction,
  MyCartUpdate,
  CartUpdate,
  ByProjectKeyRequestBuilder,
  ClientResponse,
} from '@commercetools/platform-sdk';
import api from '../api';

export const removeFromCart = async (
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  anonymApiRoot: ByProjectKeyRequestBuilder,
  loginned: boolean,
  lineItemId: string
): Promise<{ response?: ClientResponse<Cart>; success: boolean; message: string }> => {
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

    const response = loginned
      ? apiRoot &&
        (await apiRoot
          .me()
          .carts()
          .withId({ ID: activeCart.response.body.id })
          .post({
            body: {
              version: activeCart.response.body.version,
              actions: [updateAction],
            } as MyCartUpdate,
          })
          .execute())
      : await anonymApiRoot
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
