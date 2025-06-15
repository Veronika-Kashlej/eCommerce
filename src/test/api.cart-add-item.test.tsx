import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '@/api/api';
import { CartResponse } from '@/types/interfaces';
import { ClientResponse, Cart } from '@commercetools/platform-sdk';

type MockClientResponse<T> = Partial<ClientResponse<T>> & {
  body: T;
};

vi.mock('./commercetools-client');
vi.mock('./cart');

describe('Api - cartAddItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully add item to cart', async () => {
    const mockCart: Cart = {
      id: 'cart-id',
      version: 1,
      lineItems: [],
      totalPrice: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 0,
        fractionDigits: 2,
      },
      cartState: 'Active',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
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

    const mockCartResponse: CartResponse = {
      response: {
        statusCode: 200,
        body: mockCart,
      } as MockClientResponse<Cart>,
      success: true,
      message: 'Item added to cart',
    };

    vi.spyOn(api, 'cartCheckItem').mockResolvedValue({
      available: true,
      message: 'Available',
    });

    vi.spyOn(api, 'cartGet').mockResolvedValue({
      response: {
        statusCode: 200,
        body: {
          ...mockCart,
          id: 'existing-cart-id',
        },
      } as MockClientResponse<Cart>,
      success: true,
      message: 'Cart found',
    });

    vi.spyOn(api, 'cartAddItem').mockResolvedValue(mockCartResponse);
    vi.spyOn(api, 'notifyCartSubscribers').mockResolvedValue();

    const result = await api.cartAddItem('product-123', 2);

    expect(result).toEqual(mockCartResponse);
  });

  it('should handle unavailable product', async () => {
    vi.spyOn(api, 'cartCheckItem').mockResolvedValue({
      available: false,
      message: 'Not enough stock',
    });

    const result = await api.cartAddItem('product-123', 5);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Not enough stock');
    expect(api.cartCheckItem).toHaveBeenCalledWith('product-123', 5, undefined);
  });

  it('should handle errors during cart operations', async () => {
    vi.spyOn(api, 'cartCheckItem').mockResolvedValue({
      available: true,
      message: 'Available',
    });

    vi.spyOn(api, 'cartGet').mockRejectedValue(new Error('Network error'));

    const result = await api.cartAddItem('product-123');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Network error');
  });
});
