import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { getCurrentCustomer } from './customer-get';
import { ChangePasswordResult, CustomerResponse } from '../interfaces/types';

export async function changePassword(
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  if (!apiRoot) {
    return {
      success: false,
      message: 'API root is not initialized',
    };
  }

  try {
    const currentCustomer: CustomerResponse = await getCurrentCustomer(apiRoot, true);
    console.log(currentCustomer);
    let version = 1;

    if (
      'response' in currentCustomer &&
      currentCustomer.response &&
      'body' in currentCustomer.response
    )
      if (
        'body' in currentCustomer.response &&
        typeof currentCustomer.response.body === 'object' &&
        currentCustomer.response.body
      ) {
        const body: unknown = currentCustomer.response.body;
        if (
          typeof body === 'object' &&
          body &&
          'version' in body &&
          typeof body.version === 'number'
        )
          version = body.version;
      }

    const response = await apiRoot
      .me()
      .password()
      .post({
        body: {
          version: version,
          currentPassword,
          newPassword,
        },
      })
      .execute();

    return {
      success: true,
      message: 'Password changed successfully',
      response,
    };
  } catch (error) {
    let errorMessage = 'Failed to change password';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}
