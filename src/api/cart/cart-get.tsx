import api from '../api';
import { CartResponse } from '@/types/interfaces';

export const getCart = async (): Promise<CartResponse> => {
  try {
    if (api.getApiRoot) {
      const response = await api.getApiRoot.me().activeCart().get().execute();
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

      const response = await api.getAnonymApiRoot.carts().withId({ ID: cartId }).get().execute();
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
