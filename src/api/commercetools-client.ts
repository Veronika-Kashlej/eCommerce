import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import {
  ByProjectKeyRequestBuilder,
  createApiBuilderFromCtpClient,
} from '@commercetools/platform-sdk';

import env from './env';
import api, { isTokenStore } from './api';

const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: env.authUrl,
  projectKey: env.projectKey,
  credentials: {
    clientId: env.clientId,
    clientSecret: env.clientSecret,
  },
  scopes: env.scopes.split(','),
  fetch: fetch,
  tokenCache: {
    get: () => {
      const store: string | null = localStorage.getItem('commercetoolsToken');
      if (!store) return api.clearTokenCustomer();

      try {
        const cachedData: unknown = JSON.parse(store);
        if (isTokenStore(cachedData) && new Date(cachedData.expirationTime) > new Date()) {
          return cachedData;
        }
        return api.clearTokenCustomer();
      } catch {
        return api.clearTokenCustomer();
      }
    },
    set: (token) => {
      if (token.token && token.token.length > 0) {
        localStorage.setItem('commercetoolsToken', JSON.stringify(token));
      } else {
        localStorage.removeItem('commercetoolsToken');
      }
    },
  },
};

const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: env.apiUrl,
  includeRequestInErrorResponse: true,
  includeOriginalRequest: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 200,
  },
  fetch: fetch,
};

export const revokeToken = async (token: string) => {
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
    return true;
  } catch (error) {
    console.error('Token revocation failed:', error);
    return false;
  }
};

export const ctpClient = new ClientBuilder()
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  // .withLoggerMiddleware() // todo remove logger after dev
  .build();

class ApiRoot {
  private apiRoot: ByProjectKeyRequestBuilder;

  constructor() {
    this.apiRoot = this.createApiRoot();
  }

  private createApiRoot(): ByProjectKeyRequestBuilder {
    return (this.apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({
      projectKey: env.projectKey,
    }));
  }

  public get getApiRoot(): ByProjectKeyRequestBuilder {
    return this.apiRoot;
  }

  public resetApiClient(): ByProjectKeyRequestBuilder {
    const newClient = new ClientBuilder()
      .withClientCredentialsFlow(authMiddlewareOptions)
      .withHttpMiddleware(httpMiddlewareOptions)
      .build();

    this.apiRoot = createApiBuilderFromCtpClient(newClient).withProjectKey({
      projectKey: env.projectKey,
    });

    return this.apiRoot;
  }
}

export const apiRoot = new ApiRoot();
