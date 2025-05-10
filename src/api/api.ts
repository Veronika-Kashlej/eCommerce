import { apiRoot } from './commercetools-client';

import { type TokenStore } from '@commercetools/sdk-client-v2';
import {
  CustomerSignInResult,
  ClientResponse,
  CustomerSignin,
  CustomerDraft,
} from '@commercetools/platform-sdk';

// interface TokenCache {
//   get(): TokenStore | null;
//   set(cache: TokenStore): void;
//   clear(): void;
// }

// interface TokenStore {
//   token: string;
//   expirationTime: number;
//   refreshToken?: string;
// }

type registeredResponseMessage =
  | Array<{ detailedErrorMessage: string; code: string; error: string; message: string }>
  | string;

class Api {
  private static instance: Api;
  private tokenCustomer: TokenStore | undefined;

  private constructor() {}

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  public get getTokenCustomer(): TokenStore {
    return this.tokenCustomer || this.clearTokenCustomer();
  }

  public setTokenCustomer(token: TokenStore): void {
    this.tokenCustomer = token;
  }

  public get loginned(): boolean {
    if (this.tokenCustomer && new Date() < new Date(this.tokenCustomer.expirationTime)) return true;
    return false;
  }

  public logout(): void {
    this.clearTokenCustomer();
  }

  public clearTokenCustomer(): TokenStore {
    this.tokenCustomer = { token: '', expirationTime: 0 };
    return this.getTokenCustomer;
  }

  /**
   * Registers a new customer with the provided details.
   *
   * @param {CustomerDraft} data - Customer registration data containing:
   * @param {string} data.email - Customer's email address (must be valid format, e.g., user@example.com)
   * @param {string} data.password - Customer's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   * @param {string} data.firstName - Customer's first name (no special chars or numbers)
   * @param {string} data.lastName - Customer's last name (no special chars or numbers)
   * @param {string} [data.dateOfBirth] - Customer's date of birth (YYYY-MM-DD format, must be ≥13 years old, optional)
   * @param {Object} [data.addresses] - Customer's address details (optional)
   * @param {Object[]} [data.addresses] - Array of address objects
   * @param {string} data.addresses[].street - Street address (min 1 character)
   * @param {string} data.addresses[].city - City name (no special chars or numbers)
   * @param {string} data.addresses[].postalCode - Postal code (format depends on country)
   * @param {string} data.addresses[].country - Country code (must be valid, e.g., 'US', 'BY', 'UA', 'RU')
   * @param {string} [data.defaultShippingAddress] - Index of default shipping address in addresses array
   * @param {string} [data.defaultBillingAddress] - Index of default billing address in addresses array
   *
   * @returns {Promise<{
   *   response?: ClientResponse<CustomerSignInResult>;
   *   registered: boolean;
   *   message: registeredResponseMessage;
   * }>}
   *   A promise that resolves with an object containing:
   *   - `response` (optional): The API response if registration was successful.
   *   - `registered`: A boolean indicating whether registration succeeded (`true` if HTTP status 200-299).
   *   - `message`: An array of parsed error messages if registration failed, or `'OK'` if successful.
   */
  public async registerCustomer(data: CustomerDraft): Promise<{
    response?: ClientResponse<CustomerSignInResult>;
    registered: boolean;
    message: registeredResponseMessage;
  }> {
    try {
      const response: ClientResponse<CustomerSignInResult> = await apiRoot
        .customers()
        .post({
          body: {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            addresses: data.addresses,
            defaultShippingAddress: undefined,
            defaultBillingAddress: undefined,
          },
        })
        .execute();

      const registered: boolean =
        response.statusCode && response.statusCode >= 200 && response.statusCode < 300
          ? true
          : false;

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

  /**
   * Authenticates a customer with the provided email and password.
   *
   * @param {CustomerSignin} data - Customer registration data containing:
   * @param {string} data.email - Customer's registered email address (must be valid format, e.g., user@example.com)
   * @param {string} data.password - Customer's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   *
   * @returns {Promise<{ response?: ClientResponse<CustomerSignInResult>, signed: boolean, message: string }>} - Resolves with customer sign-in result containing:
   *           - ClientResponse
   *           - signed
   *           - message
   */
  public async loginCustomer(data: CustomerSignin): Promise<{
    response?: ClientResponse<CustomerSignInResult>;
    signed: boolean;
    message: string;
  }> {
    try {
      const response: ClientResponse<CustomerSignInResult> = await apiRoot
        .me()
        .login()
        .post({
          body: data,
        })
        .execute();

      const signed: boolean =
        response.statusCode && response.statusCode >= 200 && response.statusCode < 300
          ? true
          : false;
      const message: string = signed ? 'OK' : 'Not Signed';

      return { response, signed, message };
    } catch (error) {
      const message: string =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Unknown error';
      return { response: undefined, signed: false, message };
    }
  }
}

const api: Api = Api.getInstance();
export default api;
