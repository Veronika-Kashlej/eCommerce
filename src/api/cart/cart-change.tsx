import {
  ClientResponse,
  Cart,
  MyCartChangeLineItemQuantityAction,
  MyCartUpdate,
  CartUpdate,
} from '@commercetools/platform-sdk';
import api from '../api';

export const changeItemQuantity = async (
  lineItemId: string,
  newQuantity: number
): Promise<{ response?: ClientResponse<Cart>; success: boolean; message: string }> => {
  if (newQuantity < 0) {
    return {
      success: false,
      message: 'Quantity cannot be negative',
    };
  }

  if (newQuantity === 0) {
    return api.cartRemoveItems(lineItemId);
  }

  try {
    const { response: activeCart, success: cartSuccess } = await api.cartGet();

    if (!cartSuccess || !activeCart) {
      return {
        success: false,
        message: 'No active cart found',
      };
    }

    const lineItem = activeCart.body.lineItems.find((item) => item.id === lineItemId);

    if (!lineItem) {
      return {
        success: false,
        message: 'Line item not found in cart',
      };
    }

    const availability = await api.cartCheckItem(
      lineItem.productId,
      lineItem.variant?.id,
      newQuantity
    );

    if (!availability.available) {
      return {
        success: false,
        message: availability.message || 'Not enough stock',
      };
    }

    const updateAction: MyCartChangeLineItemQuantityAction = {
      action: 'changeLineItemQuantity',
      lineItemId,
      quantity: newQuantity,
    };

    const response = api.loginned
      ? await api
          .getApiRoot!.me()
          .carts()
          .withId({ ID: activeCart.body.id })
          .post({
            body: {
              version: activeCart.body.version,
              actions: [updateAction],
            } as MyCartUpdate,
          })
          .execute()
      : await api.getAnonymApiRoot
          .carts()
          .withId({ ID: activeCart.body.id })
          .post({
            body: {
              version: activeCart.body.version,
              actions: [updateAction],
            } as CartUpdate,
          })
          .execute();

    await api.notifyCartSubscribers();

    return {
      response,
      success: true,
      message: 'Quantity updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to change quantity',
    };
  }
};
