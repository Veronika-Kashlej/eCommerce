import { CartDraft, MyCartDraft } from '@commercetools/platform-sdk';
import api from '../api';
import { CartResponse } from '@/types/interfaces';

export const createCart = async (): Promise<CartResponse> => {
  let anonymousId: string | undefined;
  if (!api.loginned) anonymousId = 'anonymousId';

  const draft: CartDraft | MyCartDraft = {
    currency: 'EUR',
    country: 'DE',
    ...(anonymousId && { anonymousId }),
  };

  try {
    const response = api.getApiRoot
      ? await api.getApiRoot
          .me()
          .carts()
          .post({ body: draft as MyCartDraft })
          .execute()
      : await api.getAnonymApiRoot.carts().post({ body: draft }).execute();

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
