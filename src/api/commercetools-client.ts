import {
  Client,
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';

import {
  ByProjectKeyRequestBuilder,
  createApiBuilderFromCtpClient,
} from '@commercetools/platform-sdk';

import env from './env';

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

const getClient = (): Client => {
  const authMiddlewareOptions: AuthMiddlewareOptions = {
    host: env.authUrl,
    projectKey: env.projectKey,
    credentials: {
      clientId: env.clientId,
      clientSecret: env.clientSecret,
    },
    scopes: env.scopes.split(','),
    fetch: fetch,
  };
  return (
    new ClientBuilder()
      .withProjectKey(env.projectKey)
      .withClientCredentialsFlow(authMiddlewareOptions)
      .withHttpMiddleware(httpMiddlewareOptions)
      .withUserAgentMiddleware()
      // .withLoggerMiddleware()
      .build()
  );
};

export const apiRoot: ByProjectKeyRequestBuilder = createApiBuilderFromCtpClient(
  getClient()
).withProjectKey({ projectKey: env.projectKey });
