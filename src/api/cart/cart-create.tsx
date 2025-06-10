import {
  CartDraft,
  MyCartDraft,
  Cart,
  ByProjectKeyRequestBuilder,
  ClientResponse,
} from '@commercetools/platform-sdk';

export const createCart = async (
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  anonymApiRoot: ByProjectKeyRequestBuilder,
  loginned: boolean,
  anonymousId?: string
): Promise<{ response?: ClientResponse<Cart>; success: boolean; message: string }> => {
  if (!loginned) anonymousId = 'anonymousId';

  const draft: CartDraft | MyCartDraft = {
    currency: 'USD',
    ...(anonymousId && { anonymousId }),
  };

  try {
    const response = loginned
      ? apiRoot &&
        (await apiRoot
          .me()
          .carts()
          .post({ body: draft as MyCartDraft })
          .execute())
      : await anonymApiRoot.carts().post({ body: draft }).execute();

    return {
      response,
      success: true,
      message: 'Cart created successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
