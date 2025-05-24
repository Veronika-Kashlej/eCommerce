// Совместить с API Саши!!!
import { User } from '@/types/interfaces';
import { createRequestBuilder } from '@commercetools/platform-sdk';

const projectKey = 'project-key'; // установить ключ
const accessToken = 'токен_доступа'; // добавьте сюда токен

const requestBuilder = createRequestBuilder({ projectKey });

export async function fetchCustomer(userId: string): Promise<User> {
  const request = requestBuilder.customers.byId({ id: userId }).get();

  const response = await fetch(`https://mc.us-central1.gcp.commercetools.com/${projectKey}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: request }),
  });

  const data = await response.json();

  return data;
}
