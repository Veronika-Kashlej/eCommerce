'use strict';

import { apiRoot } from './commercetools-client';
import * as env from './commercetools-client';

import { CustomerSignInResult, ClientResponse, CustomerSignin } from '@commercetools/platform-sdk';

class Api {
  private static instance: Api;
  private tokenCustomer: string | undefined;

  private constructor() {}

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  public get getTokenCustomer(): string | undefined {
    return this.tokenCustomer || undefined;
  }

  public async getProjectDetails(): Promise<ClientResponse> {
    try {
      return await apiRoot.get().execute();
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  }

  /**
   * Registers a new customer with the provided details.
   *
   * @param {string} email - Customer's email address (must be valid format, e.g., user@example.com)
   * @param {string} password - Customer's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   * @param {string} firstName - Customer's first name (no special chars or numbers)
   * @param {string} lastName - Customer's last name (no special chars or numbers)
   * @param {string} dateOfBirth - Customer's date of birth (YYYY-MM-DD format, must be ≥13 years old)
   * @param {Object} address - Customer's address details
   * @param {string} address.street - Street address (min 1 character)
   * @param {string} address.city - City name (no special chars or numbers)
   * @param {string} address.postalCode - Postal code (format depends on country)
   * @param {string} address.country - Country code (must be valid, e.g., 'US', 'BY', 'UA', 'RU')
   *
   * @returns {Promise<CustomerSignInResult>} - Resolves with customer sign-in result on success
   * @throws {Error} - Throws error with validation details or API failure message
   *
   */
  public async registerCustomer(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    }
  ): Promise<CustomerSignInResult> {
    const response: ClientResponse<CustomerSignInResult> = await apiRoot
      .customers()
      .post({
        body: {
          email,
          password,
          firstName,
          lastName,
          dateOfBirth,
          addresses: [address],
          defaultShippingAddress: undefined,
          defaultBillingAddress: undefined,
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Authenticates a customer with the provided email and password.
   *
   * @param {string} email - Customer's registered email address (must be valid format, e.g., user@example.com)
   * @param {string} password - Customer's password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   *
   * @returns {Promise<{ customer: CustomerSignInResult; token: string }>} - Resolves with customer sign-in result containing:
   *           - Customer details
   *           - Authentication token
   *           - Cart and session information
   */
  public async loginCustomer(
    email: string,
    password: string
  ): Promise<{ customer: CustomerSignInResult; token: string }> {
    const signInData: CustomerSignin = {
      email,
      password,
    };

    const response: ClientResponse<CustomerSignInResult> = await apiRoot
      .login()
      .post({
        body: signInData,
      })
      .execute();

    const token: string = await this.getToken(email, password);

    return {
      customer: response.body,
      token,
    };
  }

  private async getToken(email: string, password: string): Promise<string> {
    const basicAuth: string = btoa(`${env.clientId}:${env.clientSecret}`);

    const response: Response = await fetch(
      `${env.authUrl}/oauth/${env.projectKey}/customers/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Auth failed: token not received`);
    }

    const data: unknown = await response.json();

    if (
      data &&
      typeof data === 'object' &&
      'access_token' in data &&
      typeof data.access_token === 'string'
    ) {
      this.setTokenCustomer(data.access_token);

      return data.access_token;
    } else throw new Error(`Token not received`);
  }

  private setTokenCustomer(token: string): void {
    this.tokenCustomer = token;
  }
}

export const api: Api = Api.getInstance();
