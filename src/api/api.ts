import { apiRoot } from './commercetools-client';

import { type TokenStore } from '@commercetools/sdk-client-v2';
import { CustomerSignInResult, ClientResponse, CustomerSignin } from '@commercetools/platform-sdk';

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

  public clearTokenCustomer(): TokenStore {
    this.tokenCustomer = { token: '', expirationTime: 0 };
    return this.getTokenCustomer;
  }

  /**
   * Registers a new customer with the provided details.
   *
   * @param {string} email - Customer's email address (must be valid format, e.g., user@example.com)
   * @param {string} password - Customer's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   * @param {string} firstName - Customer's first name (no special chars or numbers)
   * @param {string} lastName - Customer's last name (no special chars or numbers)
   * @param {string} dateOfBirth - Customer's date of birth (YYYY-MM-DD format, must be ≥13 years old)
   * @param {Object} address - Customer's address details
   * @param {string} address.street - Street address (min 1 character)
   * @param {string} address.city - City name (no special chars or numbers)
   * @param {string} address.postalCode - Postal code (format depends on country)
   * @param {string} address.country - Country code (must be valid, e.g., 'US', 'BY', 'UA', 'RU')
   *
   * @returns {Promise<CustomerSignInResult>} - Resolves with customer sign-in result on success
   * @throws {Error} - Throws error with validation details or API failure message
   *
   */
  public async registerCustomer(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    }
  ): Promise<CustomerSignInResult> {
    const response: ClientResponse<CustomerSignInResult> = await apiRoot
      .customers()
      .post({
        body: {
          email,
          password,
          firstName,
          lastName,
          dateOfBirth,
          addresses: [address],
          defaultShippingAddress: undefined,
          defaultBillingAddress: undefined,
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Authenticates a customer with the provided email and password.
   *
   * @param {string} email - Customer's registered email address (must be valid format, e.g., user@example.com)
   * @param {string} password - Customer's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   *
   * @returns {Promise<{ response?: ClientResponse, signed: boolean, message: string }>} - Resolves with customer sign-in result containing:
   *           - ClientResponse
   *           - signed
   *           - message
   */
  public async loginCustomer(
    email: string,
    password: string
  ): Promise<{ response?: ClientResponse; signed: boolean; message: string }> {
    const signInData: CustomerSignin = {
      email,
      password,
    };
    try {
      const response: ClientResponse = await apiRoot
        .me()
        .login()
        .post({
          body: signInData,
        })
        .execute();

      const signed: boolean =
        response.statusCode && response.statusCode >= 200 && response.statusCode < 300
          ? true
          : false;
      const message: string = signInData ? 'OK' : 'Not Signed';

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
