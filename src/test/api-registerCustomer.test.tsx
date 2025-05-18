import { ClientResponse, CustomerSignInResult, CustomerDraft } from '@commercetools/platform-sdk';
import api from '@/api/api';
import { apiRoot } from '@/api/commercetools-client';
import { Mock } from 'vitest';

describe('API Functions registerCustomer', () => {
  let mockExecute: Mock;
  let mockPost: Mock;
  let mockCustomers: Mock;

  function createMockResponse(
    customer: CustomerSignInResult,
    statusCode = 200
  ): ClientResponse<CustomerSignInResult> {
    return {
      statusCode,
      body: customer,
    };
  }

  function createErrorResponse(
    errors: Array<{
      code: string;
      message: string;
      detailedErrorMessage?: string;
      duplicateValue?: string;
    }>
  ) {
    return {
      response: {
        status: 400,
        data: {
          errors,
        },
      },
      body: {
        errors,
      },
    };
  }

  beforeEach(() => {
    vi.restoreAllMocks();

    mockExecute = vi.fn();
    mockPost = vi.fn().mockReturnValue({
      execute: mockExecute,
    });
    mockCustomers = vi.fn().mockReturnValue({
      post: mockPost,
    });

    vi.spyOn(apiRoot, 'customers').mockImplementation(() => mockCustomers());
    vi.spyOn(api, 'logout').mockImplementation(() => {});
  });

  it('should successfully register customer with valid data', async () => {
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

    const mockData: CustomerDraft = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'TestFirstName',
      lastName: 'TestLastName',
    };

    mockExecute.mockResolvedValue(createMockResponse(mockCustomerSignInResult));

    const result = await api.registerCustomer(mockData);

    expect(result.registered).toBe(true);
    expect(result.message).toBe('OK');
    expect(result.response?.body.customer.email).toBe('test@example.com');
    expect(mockPost).toHaveBeenCalledWith({
      body: mockData,
    });
    expect(api.logout).toHaveBeenCalled();
  });

  it('should handle registration failure with invalid data', async () => {
    const mockData: CustomerDraft = {
      email: 'invalid-email',
      password: 'short',
      firstName: 'TestFirstName',
      lastName: 'TestLastName',
    };

    mockExecute.mockResolvedValue(createMockResponse({} as CustomerSignInResult, 400));

    const result = await api.registerCustomer(mockData);

    expect(result.registered).toBe(false);
    expect(result.message).toBe('Not Registered');
    expect(result.response?.statusCode).toBe(400);
  });

  it('should handle API errors with detailed error messages', async () => {
    const mockData: CustomerDraft = {
      email: 'existing@example.com',
      password: 'password123',
      firstName: 'TestFirstName',
      lastName: 'TestLastName',
    };

    const errorResponse = createErrorResponse([
      {
        code: 'DuplicateField',
        message: 'Customer with this email already exists',
        detailedErrorMessage: 'DuplicateField: Email already exists: existing@example.com',
        duplicateValue: 'existing@example.com',
      },
    ]);

    mockExecute.mockRejectedValue(errorResponse);

    const result = await api.registerCustomer(mockData);

    expect(result.registered).toBe(false);
    expect(result.message).toEqual([
      {
        detailedErrorMessage: 'DuplicateField: Email already exists: existing@example.com',
        code: 'DuplicateField',
        error: 'Email already exists',
        message: 'existing@example.com',
      },
    ]);
    expect(result.response).toBeUndefined();
  });

  it('should handle API errors with simple error messages', async () => {
    const mockData: CustomerDraft = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'TestFirstName',
      lastName: 'TestLastName',
    };

    const errorResponse = createErrorResponse([
      {
        code: 'InvalidInput',
        message: 'Password does not meet requirements',
        duplicateValue: undefined,
      },
    ]);

    mockExecute.mockRejectedValue(errorResponse);

    const result = await api.registerCustomer(mockData);

    expect(result.registered).toBe(false);
    expect(result.message).toEqual([
      {
        detailedErrorMessage: 'Password does not meet requirements',
        code: 'InvalidInput',
        error: 'Password does not meet requirements',
        message: 'Password does not meet requirements',
      },
    ]);
    expect(result.response).toBeUndefined();
  });

  it('should handle unknown errors', async () => {
    const mockData: CustomerDraft = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'TestFirstName',
      lastName: 'TestLastName',
    };

    mockExecute.mockRejectedValue(new Error('Network error'));

    const result = await api.registerCustomer(mockData);

    expect(result.registered).toBe(false);
    expect(result.message).toEqual([]);
    expect(result.response).toBeUndefined();
  });
});
