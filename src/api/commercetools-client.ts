import {
  ClientBuilder,
  type PasswordAuthMiddlewareOptions,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';

import env from './env';
import api, { isTokenStore } from './api';

export const authMiddlewareOptions: AuthMiddlewareOptions = {
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
      const store: string | null = localStorage.getItem('anonymToken');
      if (!store) return api.clearTokenAnonym();

      try {
        const cachedData: unknown = JSON.parse(store);
        if (isTokenStore(cachedData)) {
          if (new Date(cachedData.expirationTime) > new Date()) {
            return cachedData;
          }
          if (cachedData.refreshToken) {
            return cachedData;
          }
        }
        return api.clearTokenAnonym();
      } catch {
        return api.clearTokenAnonym();
      }
    },
    set: (token) => {
      if (token.token) {
        localStorage.setItem('anonymToken', JSON.stringify(token));
      } else {
        localStorage.removeItem('anonymToken');
      }
    },
  },
};

const passwordAuthMiddlewareOptions: PasswordAuthMiddlewareOptions = {
  host: env.authUrl,
  projectKey: env.projectKey,
  credentials: {
    clientId: env.clientId,
    clientSecret: env.clientSecret,
    user: {
      username: '',
      password: '',
    },
  },
  scopes: env.scopes.split(','),
  fetch: fetch,
  tokenCache: {
    get: () => {
      const store: string | null = localStorage.getItem('commercetoolsToken');
      if (!store) return api.clearTokenCustomer();

      try {
        const cachedData: unknown = JSON.parse(store);
        if (isTokenStore(cachedData)) {
          if (new Date(cachedData.expirationTime) > new Date()) {
            return cachedData;
          }
          if (cachedData.refreshToken) {
            return cachedData;
          }
        }
        return api.clearTokenCustomer();
      } catch {
        return api.clearTokenCustomer();
      }
    },
    set: (token) => {
      if (token.token) {
        localStorage.setItem('commercetoolsToken', JSON.stringify(token));
      } else {
        localStorage.removeItem('commercetoolsToken');
      }
    },
  },
};

export const createPasswordClient = (username: string, password: string) => {
  return (
    new ClientBuilder()
      .withPasswordFlow({
        ...passwordAuthMiddlewareOptions,
        credentials: {
          ...passwordAuthMiddlewareOptions.credentials,
          user: { username, password },
        },
      })
      .withHttpMiddleware(httpMiddlewareOptions)
      // .withLoggerMiddleware() // todo remove logger after dev
      .build()
  );
};

export const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: env.apiUrl,
  includeRequestInErrorResponse: true,
  includeOriginalRequest: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 200,
  },
  fetch: fetch,
};
