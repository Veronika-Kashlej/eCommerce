import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { CustomerResponse } from '../interfaces/types';

export async function getCurrentCustomer(
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  isLoggedIn: boolean
): Promise<CustomerResponse> {
  if (!apiRoot || !isLoggedIn) {
    return {
      success: false,
      message: 'User not authenticated',
    };
  }

  try {
    const response = await apiRoot.me().get().execute();

    return {
      response,
      success: true,
      message: 'Customer data retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
