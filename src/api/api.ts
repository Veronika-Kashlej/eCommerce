import {
  authMiddlewareOptions,
  createPasswordClient,
  httpMiddlewareOptions,
} from './commercetools-client';

import { Client, ClientBuilder, type TokenStore } from '@commercetools/sdk-client-v2';
import {
  CustomerSignInResult,
  ClientResponse,
  CustomerDraft,
  CustomerPagedQueryResponse,
  MyCustomerSignin,
  ByProjectKeyRequestBuilder,
  ProductPagedQueryResponse,
  createApiBuilderFromCtpClient,
  Product,
} from '@commercetools/platform-sdk';

import { ProductsQueryArgs } from './api-interfaces';
import env from './env';

type registeredResponseMessage =
  | Array<{ detailedErrorMessage: string; code: string; error: string; message: string }>
  | string;

class Api {
  private static instance: Api;
  private apiRoot: ByProjectKeyRequestBuilder | undefined;
  private anonymClient: Client;
  private anonymApiRoot: ByProjectKeyRequestBuilder;
  private eventTarget = new EventTarget();

  private constructor() {
    this.anonymClient = new ClientBuilder()
      .withClientCredentialsFlow(authMiddlewareOptions)
      .withHttpMiddleware(httpMiddlewareOptions)
      .build();
    this.anonymApiRoot = createApiBuilderFromCtpClient(this.anonymClient).withProjectKey({
      projectKey: env.projectKey,
    });
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  public onLoginStatusChange(callback: () => void): void {
    this.eventTarget.addEventListener('loginStatusChanged', callback);
  }

  public offLoginStatusChange(callback: () => void): void {
    this.eventTarget.addEventListener('loginStatusChanged', callback);
  }

  public get getAnonymApiRoot(): ByProjectKeyRequestBuilder {
    return this.anonymApiRoot;
  }

  public get getTokenCustomer(): TokenStore | undefined {
    const store: string | null = localStorage.getItem('commercetoolsToken');
    if (store) {
      const cachedData: unknown = JSON.parse(store);
      if (isTokenStore(cachedData)) return cachedData;
    }
    this.clearTokenCustomer();
    return undefined;
  }

  public get loginned(): boolean {
    const token: TokenStore | undefined = this.getTokenCustomer;
    if (token && new Date() < new Date(token.expirationTime)) {
      return true;
    } else return false;
  }

  public async logout(): Promise<void> {
    const token: string | undefined = this.getTokenCustomer?.token;
    this.revokeToken(token);
    this.resetApiRoot();
    this.notifyLoginStatusChange();
  }

  public async revokeToken(token: string | undefined): Promise<void> {
    if (token && token.length > 0)
      try {
        const basicAuth = btoa(`${env.clientId}:${env.clientSecret}`);

        const response = await fetch(`${env.authUrl}/oauth/token/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            token: token,
            token_type_hint: 'access_token',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Token revocation failed:', error);
      }
  }

  public clearTokenCustomer(): TokenStore {
    localStorage.removeItem('commercetoolsToken');
    return { token: '', expirationTime: 0, refreshToken: undefined };
  }

  public resetApiRoot(): void {
    this.clearTokenCustomer();
    this.apiRoot = undefined;
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
    await this.logout();

    try {
      const response: ClientResponse<CustomerSignInResult> = await this.anonymApiRoot
        .customers()
        .post({
          body: data,
        })
        .execute();

      const registered: boolean =
        response.statusCode && response.statusCode >= 200 && response.statusCode < 300
          ? true
          : false;

      const message: string = registered ? 'OK' : 'Not Registered';

      await this.logout();
      return { response, registered, message };
    } catch (error) {
      await this.logout();

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
  public async loginCustomer(data: MyCustomerSignin): Promise<{
    response?: ClientResponse<CustomerSignInResult>;
    signed: boolean;
    message: string;
  }> {
    await this.logout();

    try {
      const client = createPasswordClient(data.email, data.password);
      this.apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
        projectKey: env.projectKey,
      });

      const response = await this.apiRoot.me().login().post({ body: data }).execute();

      const signed: boolean =
        response.statusCode && response.statusCode >= 200 && response.statusCode < 300
          ? true
          : false;
      const message = signed ? 'OK' : 'Not Signed';

      if (signed) {
        this.notifyLoginStatusChange();
        return { response, signed, message };
      } else {
        this.clearTokenCustomer();
        return { response, signed, message };
      }
    } catch (error) {
      this.clearTokenCustomer();

      const message = error instanceof Error ? error.message : 'Unknown error';
      return { response: undefined, signed: false, message };
    }
  }

  /**
   * Finds a customer by email address
   *
   * @param {string} email - The email address to search for.
   * @returns {Promise<{response?: ClientResponse<CustomerPagedQueryResponse>, found: boolean, message: string, id?: string}>}
   *   An object containing:
   *   - `response` (optional): Raw API response if successful
   *   - `found`: Boolean indicating if customer exists
   *   - `message`: Status message ('Customer found'/'Customer not found'/'Server connection failure')
   *   - `id` (optional): Customer ID if found
   */

  public async getCustomerByEmail(email: string): Promise<{
    response?: ClientResponse<CustomerPagedQueryResponse>;
    found: boolean;
    message: string;
    id?: string;
  }> {
    if (email === '') {
      return {
        response: undefined,
        found: false,
        message: 'Email is required',
        id: undefined,
      };
    }

    try {
      const response = await this.anonymApiRoot
        .customers()
        .get({
          queryArgs: {
            where: `email="${email}"`,
            limit: 1,
          },
        })
        .execute();

      const found = response.body.count > 0;

      return {
        response,
        found,
        message: found ? 'Customer found' : 'Customer not found',
        id: found ? response.body.results[0].id : undefined,
      };
    } catch (error) {
      console.error('Error in getCustomerByEmail:', error);
      return {
        response: undefined,
        found: false,
        message: 'Server connection failure',
        id: undefined,
      };
    }
  }

  /**
   * Retrieves a paginated list of products from Commercetools based on query parameters.
   *
   * @param {ProductsQueryArgs} queryArgs - Query parameters for filtering, sorting and pagination.
   * @param {number} [queryArgs.limit=20] - Maximum number of products to return (default: 20).
   * @param {number} [queryArgs.offset=0] - Number of products to skip (for pagination).
   * @param {string|string[]} [queryArgs.where] - Query predicate in Commercetools Predicate Language.
   * @param {string|string[]} [queryArgs.expand] - References to expand (e.g., ['productType', 'taxCategory']).
   * @param {string|string[]} [queryArgs.sort] - Sort criteria (e.g., 'createdAt desc').
   * @param {boolean} [queryArgs.staged] - Whether to include staged changes (default: false).
   * @param {string} [queryArgs.priceCurrency] - Currency code for price selection.
   * @param {string} [queryArgs.priceCountry] - Country code for price selection.
   *
   * @returns {Promise<ClientResponse<ProductPagedQueryResponse>|undefined>}
   *   - Returns the API response with products data if successful.
   *   - Returns undefined and logs error if the request fails.
   *
   * @throws {Error}
   *   - Throws and logs errors from Commercetools API (network issues, invalid queries etc.)
   *
   * @example
   * Get first 10 published products
   * getProductsList({
   *   limit: 10,
   *   where: 'masterData(published=true)'
   * });
   *
   * @example
   * Get products sorted by creation date (newest first)
   * getProductsList({
   *   sort: 'createdAt desc',
   *   expand: ['productType']
   * });
   */
  public async getProductsList(
    queryArgs?: ProductsQueryArgs
  ): Promise<ClientResponse<ProductPagedQueryResponse> | undefined> {
    if (this.anonymApiRoot && this.loginned)
      try {
        const response = await this.anonymApiRoot
          .products()
          .get({
            queryArgs: {
              ...queryArgs,
            },
          })
          .execute();

        console.log(response.body.results);

        return response;
      } catch (error) {
        console.error('Error while receiving goods:', error);
      }
  }

  public async getProductById(productId: string): Promise<Product> {
    try {
      const response = await this.anonymApiRoot
        .products()
        .withId({ ID: productId })
        .get()
        .execute();
      return response.body;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  private notifyLoginStatusChange(): void {
    this.eventTarget.dispatchEvent(new Event('loginStatusChanged'));
  }
}

export function isTokenStore(data: unknown): data is TokenStore {
  if (
    data &&
    typeof data === 'object' &&
    'token' in data &&
    data.token &&
    typeof data.token === 'string' &&
    'expirationTime' in data &&
    data.expirationTime &&
    typeof data.expirationTime === 'number' &&
    (('refreshToken' in data &&
      data.refreshToken &&
      (typeof data.refreshToken === 'string' || typeof data.refreshToken === 'undefined')) ||
      !('refreshToken' in data))
  )
    return true;
  return false;
}

const api: Api = Api.getInstance();
export default api;
