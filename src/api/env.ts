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

const env = {
  projectKey: requireEnvVar('VITE_CTP_PROJECT_KEY'),
  clientId: requireEnvVar('VITE_CTP_CLIENT_ID'),
  clientSecret: requireEnvVar('VITE_CTP_CLIENT_SECRET'),
  authUrl: requireEnvVar('VITE_CTP_AUTH_URL'),
  apiUrl: requireEnvVar('VITE_CTP_API_URL'),
  scopes: requireEnvVar('VITE_CTP_SCOPES'),
};

export default env;
