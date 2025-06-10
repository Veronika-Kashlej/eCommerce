import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

export const isCartEmpty = async (
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  anonymApiRoot: ByProjectKeyRequestBuilder,
  loginned: boolean
): Promise<boolean> => {
  try {
    const cartResponse = loginned
      ? apiRoot && (await apiRoot.me().activeCart().get().execute())
      : await anonymApiRoot
          .carts()
          .withId({ ID: localStorage.getItem('anonymousCartId') || '' })
          .get()
          .execute();

    const isEmpty = cartResponse?.body.lineItems.length === 0;

    return isEmpty;
  } catch {
    return true;
  }
};
