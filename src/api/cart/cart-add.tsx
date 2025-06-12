import {
  Cart,
  MyCartAddLineItemAction,
  MyCartUpdate,
  CartUpdate,
  ByProjectKeyRequestBuilder,
  ClientResponse,
} from '@commercetools/platform-sdk';
import api from '../api';

export const addToCart = async (
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  anonymApiRoot: ByProjectKeyRequestBuilder,
  loginned: boolean,
  productId: string,
  quantity: number = 1,
  attempt: number = 0,
  maxAttempts: number = 3,
  variantId?: number
): Promise<{ response?: ClientResponse<Cart>; success: boolean; message: string }> => {
  const availability = await api.cartCheckItem(productId, quantity, variantId);

  if (!availability.available) {
    return {
      success: false,
      message: availability.message || 'Not enough stock',
    };
  }

  if (attempt >= maxAttempts) {
    return {
      success: false,
      message: 'Maximum attempts reached. Failed to add item to cart.',
    };
  }

  try {
    const activeCart = await api.cartGet();
    if (activeCart.response) {
      const updateAction: MyCartAddLineItemAction = {
        action: 'addLineItem',
        productId,
        // variantId,
        quantity,
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

      await api.notifyCartSubscribers();

      return {
        response,
        success: true,
        message: 'Item added to cart',
      };
    } else {
      const createResponse = await api.cartCreate();
      if (!createResponse.response) {
        return {
          success: false,
          message: 'Failed to create new cart',
        };
      }

      if (!loginned) {
        localStorage.setItem('anonymousCartId', createResponse.response.body.id);
      }

      return await addToCart(
        apiRoot,
        anonymApiRoot,
        loginned,
        productId,
        quantity,
        attempt + 1,
        maxAttempts
      );
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
