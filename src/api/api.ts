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
  createApiBuilderFromCtpClient,
  ProductProjectionPagedSearchResponse,
  Product,
  ProductProjection,
  CategoryPagedQueryResponse,
} from '@commercetools/platform-sdk';

import { ProductProjectionSearchArgs } from './interfaces/types';
import env from './env';

import { registerCustomer } from './customers/customer-registration';
import { getCurrentCustomer } from './customers/customer-get';
import { updateCustomer } from './customers/customer-update';
import { CustomerUpdateData } from './interfaces/types';
import { getProductsList } from './products/product-query';
import { getProductById, getProductProjectionById } from './products/product-by-id';

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
      // .withLoggerMiddleware() // todo remove logger after dev
      .build();
    this.anonymApiRoot = createApiBuilderFromCtpClient(this.anonymClient).withProjectKey({
      projectKey: env.projectKey,
    });

    this.initApiRoot();
  }

  private initApiRoot() {
    const token = this.getTokenCustomer;
    if (!token) return;
    const fixedToken = token.token.startsWith('Bearer ') ? token.token : `Bearer ${token.token}`;
    const client = new ClientBuilder()
      .withExistingTokenFlow(fixedToken, { force: true })
      .withHttpMiddleware(httpMiddlewareOptions)
      // .withLoggerMiddleware() // todo remove logger after dev
      .build();

    this.apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
      projectKey: env.projectKey,
    });
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  public async getCurrentCustomer() {
    return getCurrentCustomer(this.apiRoot, this.loginned);
  }

  public async updateCustomer(data: CustomerUpdateData) {
    return updateCustomer(this.apiRoot, this.loginned, data);
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
    if (this.apiRoot && token && new Date() < new Date(token.expirationTime)) {
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

  public clearTokenAnonym(): TokenStore {
    localStorage.removeItem('anonymToken');
    return { token: '', expirationTime: 0, refreshToken: undefined };
  }

  public resetApiRoot(): void {
    this.clearTokenCustomer();
    this.apiRoot = undefined;
  }

  public async registerCustomer(data: CustomerDraft): Promise<{
    response?: ClientResponse<CustomerSignInResult>;
    registered: boolean;
    message: registeredResponseMessage;
  }> {
    await this.logout();
    const result = await registerCustomer(this.anonymApiRoot, data);
    await this.logout();
    return result;
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

  public async getCategories(): Promise<ClientResponse<CategoryPagedQueryResponse> | undefined> {
    return await this.anonymApiRoot
      .categories()
      .get({
        queryArgs: {
          limit: 100,
          expand: ['parent'],
        },
      })
      .execute();
  }

  public async getProductsList(
    queryArgs?: ProductProjectionSearchArgs
  ): Promise<ClientResponse<ProductProjectionPagedSearchResponse> | undefined> {
    if (!this.anonymApiRoot) return undefined;
    return getProductsList(this.anonymApiRoot, queryArgs);
  }

  public async getProductsFacets(): Promise<void> {
    try {
      // if (this.anonymApiRoot) {
      const res: ClientResponse<ProductProjectionPagedSearchResponse> = await this.anonymApiRoot
        .productProjections()
        .search()
        .get({
          queryArgs: {
            facet: [
              // 'variants.attributes.brand',
              // 'masterVariant.attributes.color.en-US',
              'variants.attributes.color.en-US',
              // 'variants.attributes.color.en',
              // 'variants.attributes.color'
            ],
            limit: 0,
          },
        })
        .execute();
      console.log('getProductsFacets =', res);

      // const products: ProductInfo[] = body.results.map((item) => getBriefInfoFromProductProjection(item));
      // return products;
      // }
    } catch (error) {
      console.error('Error while receiving goods:', error);
      // return [];
    }
  }

  public async getProductById(productId: string): Promise<Product | undefined> {
    if (!this.anonymApiRoot) return undefined;
    return getProductById(this.anonymApiRoot, productId);
  }

  public async getProductProjectionById(productId: string): Promise<ProductProjection | undefined> {
    if (!this.anonymApiRoot) return undefined;
    return getProductProjectionById(this.anonymApiRoot, productId);
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
