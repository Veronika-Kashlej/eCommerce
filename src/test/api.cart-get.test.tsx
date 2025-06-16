import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '@/api/api';
import { CartResponse } from '@/types/interfaces';
import { Cart, ClientResponse, ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

describe('Api - cartGet', () => {
  const mockCart: Cart = {
    id: 'test-cart-id',
    version: 1,
    createdAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    lineItems: [],
    cartState: 'Active',
    totalPrice: {
      type: 'centPrecision',
      currencyCode: 'USD',
      centAmount: 0,
      fractionDigits: 2,
    },
    customLineItems: [],
    taxMode: 'Disabled',
    taxRoundingMode: 'HalfEven',
    taxCalculationMode: 'LineItemLevel',
    inventoryMode: 'None',
    shippingMode: 'Single',
    shipping: [],
    itemShippingAddresses: [],
    discountCodes: [],
    directDiscounts: [],
    refusedGifts: [],
    origin: 'Customer',
  };

  const mockCartResponse: ClientResponse<Cart> = {
    body: mockCart,
    statusCode: 200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return active cart for authenticated user', async () => {
    const mockApiRoot: Partial<ByProjectKeyRequestBuilder> = {
      me: vi.fn().mockReturnValue({
        activeCart: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue(mockCartResponse),
          }),
        }),
      }),
    };

    vi.spyOn(api, 'getApiRoot', 'get').mockReturnValue(mockApiRoot as ByProjectKeyRequestBuilder);

    const result = await api.cartGet();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Active cart retrieved');
    expect(result.response?.body.id).toBe('test-cart-id');
  });

  it('should return anonymous cart when user is not authenticated', async () => {
    const mockAnonymApiRoot: Partial<ByProjectKeyRequestBuilder> = {
      carts: vi.fn().mockReturnValue({
        withId: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue(mockCartResponse),
          }),
        }),
      }),
    };

    vi.spyOn(api, 'getApiRoot', 'get').mockReturnValue(undefined);
    vi.spyOn(api, 'getAnonymApiRoot', 'get').mockReturnValue(
      mockAnonymApiRoot as ByProjectKeyRequestBuilder
    );

    localStorage.setItem('anonymousCartId', 'test-cart-id');

    const result = await api.cartGet();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Anonymous cart retrieved');
    expect(result.response?.body.id).toBe('test-cart-id');
  });

  it('should return error when no anonymous cart exists', async () => {
    vi.spyOn(api, 'getApiRoot', 'get').mockReturnValue(undefined);
    vi.spyOn(api, 'getAnonymApiRoot', 'get').mockReturnValue({
      carts: vi.fn().mockReturnValue({}),
    } as unknown as ByProjectKeyRequestBuilder);

    const result = await api.cartGet();

    expect(result.success).toBe(false);
    expect(result.message).toBe('No active cart found');
    expect(result.response).toBeUndefined();
  });

  it('should handle API errors for authenticated user', async () => {
    const mockApiRoot: Partial<ByProjectKeyRequestBuilder> = {
      me: vi.fn().mockReturnValue({
        activeCart: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue({
            execute: vi.fn().mockRejectedValue(new Error('API error')),
          }),
        }),
      }),
    };

    vi.spyOn(api, 'getApiRoot', 'get').mockReturnValue(mockApiRoot as ByProjectKeyRequestBuilder);

    const result = await api.cartGet();

    expect(result.success).toBe(false);
    expect(result.message).toBe('API error');
  });

  it('should handle API errors for anonymous user', async () => {
    const mockAnonymApiRoot: Partial<ByProjectKeyRequestBuilder> = {
      carts: vi.fn().mockReturnValue({
        withId: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue({
            execute: vi.fn().mockRejectedValue(new Error('Not found')),
          }),
        }),
      }),
    };

    vi.spyOn(api, 'getApiRoot', 'get').mockReturnValue(undefined);
    vi.spyOn(api, 'getAnonymApiRoot', 'get').mockReturnValue(
      mockAnonymApiRoot as ByProjectKeyRequestBuilder
    );

    localStorage.setItem('anonymousCartId', 'test-cart-id');

    const result = await api.cartGet();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Not found');
  });

  it('should handle unexpected errors', async () => {
    vi.spyOn(api, 'getApiRoot', 'get').mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const result: CartResponse = await api.cartGet();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Unexpected error');
  });
});
