import api from '../api';

export const isCartEmpty = async (): Promise<boolean> => {
  try {
    const cartResponse = api.getApiRoot
      ? await api.getApiRoot.me().activeCart().get().execute()
      : await api.getAnonymApiRoot
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
