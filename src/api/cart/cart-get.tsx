import { ByProjectKeyRequestBuilder, Cart, ClientResponse } from '@commercetools/platform-sdk';

export const getCart = async (
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  anonymApiRoot: ByProjectKeyRequestBuilder,
  loginned: boolean
): Promise<{ response?: ClientResponse<Cart>; success: boolean; message: string }> => {
  try {
    if (loginned) {
      const response = apiRoot && (await apiRoot.me().activeCart().get().execute());
      return {
        response,
        success: true,
        message: 'Active cart retrieved',
      };
    } else {
      const cartId = localStorage.getItem('anonymousCartId');
      if (!cartId) {
        return {
          success: false,
          message: 'No active cart found',
        };
      }

      const response = await anonymApiRoot.carts().withId({ ID: cartId }).get().execute();
      return {
        response,
        success: true,
        message: 'Anonymous cart retrieved',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
