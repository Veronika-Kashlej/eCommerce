import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '@/api/api';
import { CartDiscountsResponse } from '@/types/interfaces';
import { ByProjectKeyRequestBuilder, Cart } from '@commercetools/platform-sdk';

const mockCartDiscounts = {
  get: () => ({
    execute: vi.fn(),
  }),
};

const createMockApiRoot = () => ({
  cartDiscounts: vi.fn(() => mockCartDiscounts),
  args: { projectKey: 'test' },
});

describe('Api - discountCartGet', () => {
  const mockCart: Cart = {
    id: 'test-cart-id',
    version: 1,
    lineItems: [],
    customLineItems: [],
    totalPrice: {
      type: 'centPrecision',
      centAmount: 100,
      currencyCode: 'EUR',
      fractionDigits: 2,
    },
    taxMode: 'Disabled',
    taxRoundingMode: 'HalfEven',
    taxCalculationMode: 'LineItemLevel',
    inventoryMode: 'None',
    cartState: 'Active',
    shippingMode: 'Single',
    shipping: [],
    itemShippingAddresses: [],
    discountCodes: [],
    directDiscounts: [],
    refusedGifts: [],
    origin: 'Customer',
    createdAt: '',
    lastModifiedAt: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'cartGet').mockResolvedValue({
      response: { body: mockCart, statusCode: 200 },
      success: true,
      message: 'Cart found',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return cart discounts structure', async () => {
    const mockApiRoot = createMockApiRoot();
    mockCartDiscounts.get().execute.mockResolvedValue({
      body: { results: [] },
      statusCode: 200,
    });

    vi.spyOn(api, 'getAnonymApiRoot', 'get').mockReturnValue(
      mockApiRoot as unknown as ByProjectKeyRequestBuilder
    );

    const result = await api.discountCartGet();
    expect(result).toEqual({
      directDiscounts: expect.any(Array),
      discountCodes: expect.any(Array),
      cart: expect.objectContaining({
        id: 'test-cart-id',
        version: 1,
      }),
    });
  });

  it('should handle API errors', async () => {
    const mockApiRoot = createMockApiRoot();
    mockCartDiscounts.get().execute.mockRejectedValue(new Error('API error'));

    vi.spyOn(api, 'getAnonymApiRoot', 'get').mockReturnValue(
      mockApiRoot as unknown as ByProjectKeyRequestBuilder
    );

    const result: CartDiscountsResponse = await api.discountCartGet();
    expect(result).toEqual({
      directDiscounts: [],
      discountCodes: [],
      cart: expect.objectContaining({
        id: 'test-cart-id',
        version: 1,
      }),
    });
  });

  it('should throw error when cart not found', async () => {
    vi.spyOn(api, 'cartGet').mockResolvedValue({
      response: undefined,
      success: false,
      message: 'Cart not found',
    });

    await expect(api.discountCartGet()).rejects.toThrow('Cart not found');
  });
});
