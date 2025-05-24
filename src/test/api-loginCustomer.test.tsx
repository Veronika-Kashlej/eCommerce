import { ClientResponse, CustomerSignInResult } from '@commercetools/platform-sdk';
import api from '@/api/api';
// import { apiRoot } from '@/api/commercetools-client';
import { Mock } from 'vitest';

describe('API Functions loginCustomer', () => {
  let mockExecute: Mock;
  // let mockPost: Mock;
  // let mockLogin: Mock;
  // let mockMe: Mock;

  function createMockResponse(
    customer: CustomerSignInResult,
    statusCode = 200
  ): ClientResponse<CustomerSignInResult> {
    return {
      statusCode,
      body: customer,
    };
  }

  beforeEach(() => {
    vi.restoreAllMocks();

    mockExecute = vi.fn();
    // mockPost = vi.fn().mockReturnValue({
    //   execute: mockExecute,
    // });
    // mockLogin = vi.fn().mockReturnValue({
    //   post: mockPost,
    // });
    // mockMe = vi.fn().mockReturnValue({
    //   login: mockLogin,
    // });

    vi.spyOn(api, 'logout').mockImplementation(() => Promise.resolve());
  });

  it('should successfully login customer with valid credentials', async () => {
    const mockCustomerSignInResult: CustomerSignInResult = {
      customer: {
        id: 'test-id',
        email: 'test@example.com',
        version: 1,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        addresses: [],
        isEmailVerified: false,
        stores: [],
        authenticationMode: 'Password',
      },
    };

    const mockData = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockExecute.mockResolvedValue(createMockResponse(mockCustomerSignInResult));

    const result = await api.loginCustomer(mockData);

    expect(result.signed).toBe(true);
    expect(result.message).toBe('OK');
    expect(result.response?.body.customer.email).toBe('test@example.com');
    expect(api.logout).toHaveBeenCalled();
  });

  it('should handle login failure with invalid credentials', async () => {
    const mockData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    mockExecute.mockResolvedValue(createMockResponse({} as CustomerSignInResult));

    const result = await api.loginCustomer(mockData);

    expect(result.signed).toBe(false);
    expect(result.message).toBe('Account with the given credentials not found.');
  });

  it('should handle API errors', async () => {
    const mockData = {
      email: 'test@example.com',
      password: 'password1234',
    };

    mockExecute.mockRejectedValue(
      new Error('Customer account with the given credentials not found.')
    );

    const result = await api.loginCustomer(mockData);

    expect(result.signed).toBe(false);
    expect(result.message).toBe('Customer account with the given credentials not found.');
    expect(result.response).toBeUndefined();
  });
});
