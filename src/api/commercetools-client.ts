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
      const cachedData: unknown = localStorage.getItem('commercetoolsToken') || undefined;
      if (isTokenStore(cachedData)) {
        return cachedData;
      } else return api.clearTokenCustomer();
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

export const ctpClient = new ClientBuilder()
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  // .withLoggerMiddleware() // todo remove logger after dev
  .build();

export const apiRoot = createApiBuilderFromCtpClient(ctpClient).withProjectKey({
  projectKey: env.projectKey,
});
