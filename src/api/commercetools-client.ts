'use strict';

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

const requiredEnvVars: string[] = [
  'VITE_CTP_PROJECT_KEY',
  'VITE_CTP_SCOPES',
  'VITE_CTP_API_URL',
  'VITE_CTP_AUTH_URL',
  'VITE_CTP_CLIENT_ID',
  'VITE_CTP_CLIENT_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

function requireEnvVar<K extends keyof ImportMetaEnv>(name: K): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const projectKey = requireEnvVar('VITE_CTP_PROJECT_KEY');
export const clientId = requireEnvVar('VITE_CTP_CLIENT_ID');
export const clientSecret = requireEnvVar('VITE_CTP_CLIENT_SECRET');
export const authUrl = requireEnvVar('VITE_CTP_AUTH_URL');
export const apiUrl = requireEnvVar('VITE_CTP_API_URL');
export const scopes = requireEnvVar('VITE_CTP_SCOPES');

const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: apiUrl,
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
    host: authUrl,
    projectKey: projectKey,
    credentials: {
      clientId: clientId,
      clientSecret: clientSecret,
    },
    scopes: scopes.split(','),
    fetch: fetch,
  };
  return (
    new ClientBuilder()
      .withProjectKey(projectKey)
      .withClientCredentialsFlow(authMiddlewareOptions)
      .withHttpMiddleware(httpMiddlewareOptions)
      .withUserAgentMiddleware()
      // .withLoggerMiddleware()
      .build()
  );
};

export const apiRoot: ByProjectKeyRequestBuilder = createApiBuilderFromCtpClient(
  getClient()
).withProjectKey({ projectKey });
