import { ClientResponse, CustomerSignInResult, CustomerDraft } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { CustomerRegistrationResponse, registeredResponseMessage } from '../interfaces/types';

/**
 * Registers a new customer with the provided details.
 *
 * @param {ByProjectKeyRequestBuilder} anonymApiRoot - Anonymous API root instance
 * @param {CustomerDraft} data - Customer registration data
 * @returns {Promise<{
 *   response?: ClientResponse<CustomerSignInResult>;
 *   registered: boolean;
 *   message: registeredResponseMessage;
 * }>}
 */
export async function registerCustomer(
  anonymApiRoot: ByProjectKeyRequestBuilder,
  data: CustomerDraft
): Promise<CustomerRegistrationResponse> {
  try {
    const response: ClientResponse<CustomerSignInResult> = await anonymApiRoot
      .customers()
      .post({
        body: data,
      })
      .execute();

    const registered: boolean =
      response.statusCode && response.statusCode >= 200 && response.statusCode < 300 ? true : false;

    const message: string = registered ? 'OK' : 'Not Registered';

    return { response, registered, message };
  } catch (error) {
    const message: registeredResponseMessage = [];

    if (
      error &&
      typeof error === 'object' &&
      'body' in error &&
      error.body &&
      typeof error.body === 'object' &&
      'errors' in error.body &&
      error.body.errors &&
      Array.isArray(error.body.errors)
    ) {
      error.body.errors.forEach(
        (value: {
          code: string;
          detailedErrorMessage?: string;
          message: string;
          duplicateValue?: string;
        }) => {
          if (value.detailedErrorMessage) {
            const parsedValue = value.detailedErrorMessage.split(':').map((part) => part.trim());
            const [code = '', error = '', ...rest] = parsedValue;
            message.push({
              detailedErrorMessage: value.detailedErrorMessage,
              code,
              error,
              message: rest.join(':'),
            });
          } else {
            message.push({
              detailedErrorMessage: value.message,
              code: value.code,
              error: value.duplicateValue || value.message,
              message: value.message,
            });
          }
        }
      );
    }
    return { response: undefined, registered: false, message };
  }
}
