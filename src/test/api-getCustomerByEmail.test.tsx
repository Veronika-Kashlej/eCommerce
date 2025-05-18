import { ClientResponse, CustomerPagedQueryResponse, Customer } from '@commercetools/platform-sdk';
import api from '@/api/api';
import { apiRoot } from '@/api/commercetools-client';
import { Mock } from 'vitest';

describe('API Functions getCustomerByEmail', () => {
  let mockExecute: Mock;
  let mockGet: Mock;
  let mockCustomers: Mock;

  function createMockResponse(
    results: Customer[] = [],
    count: number = results.length,
    statusCode = 200
  ): ClientResponse<CustomerPagedQueryResponse> {
    return {
      statusCode,
      body: {
        count,
        results,
        limit: 20,
        offset: 0,
        total: count,
        facets: {},
      } as CustomerPagedQueryResponse,
    };
  }

  beforeEach(() => {
    vi.restoreAllMocks();

    mockExecute = vi.fn();
    mockGet = vi.fn().mockReturnValue({
      execute: mockExecute,
    });
    mockCustomers = vi.fn().mockReturnValue({
      get: mockGet,
    });

    vi.spyOn(apiRoot, 'customers').mockImplementation(() => mockCustomers());
  });

  it('should return customer when email exists', async () => {
    const mockCustomer: Customer = {
      id: 'test-id',
      email: 'test@example.com',
      version: 1,
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      addresses: [],
      isEmailVerified: false,
      stores: [],
      authenticationMode: 'ExternalAuth',
    };

    mockExecute.mockResolvedValue(createMockResponse([mockCustomer], 1));

    const result = await api.getCustomerByEmail('test@example.com');

    expect(result.found).toBe(true);
    expect(result.message).toBe('Customer found');
    expect(result.id).toBe('test-id');
    expect(mockGet).toHaveBeenCalledWith({
      queryArgs: {
        where: 'email="test@example.com"',
        limit: 1,
      },
    });
  });

  it('should handle customer not found', async () => {
    mockExecute.mockResolvedValue(createMockResponse([], 0));

    const result = await api.getCustomerByEmail('nonexistent@example.com');

    expect(result.found).toBe(false);
    expect(result.message).toBe('Customer not found');
    expect(result.id).toBeUndefined();
  });

  it('should handle API errors', async () => {
    mockExecute.mockRejectedValue(new Error('API error'));

    const result = await api.getCustomerByEmail('test@example.com');

    expect(result.found).toBe(false);
    expect(result.message).toBe('Server connection failure');
    expect(result.response).toBeUndefined();
  });

  it('should validate email parameter', async () => {
    const result = await api.getCustomerByEmail('');

    expect(result.found).toBe(false);
    expect(result.message).toBe('Email is required');
  });
});
