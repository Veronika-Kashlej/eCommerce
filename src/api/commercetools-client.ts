import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

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
      if (store) {
        const cachedData: unknown = localStorage.getItem('commercetoolsToken');
        if (isTokenStore(cachedData)) {
          return cachedData;
        }
      }
      return api.clearTokenCustomer();
    },
    set: (token) => {
      localStorage.setItem('commercetoolsToken', JSON.stringify(token));
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

export const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({
  projectKey: env.projectKey,
});
