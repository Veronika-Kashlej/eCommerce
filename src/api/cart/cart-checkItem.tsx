import { AvailabilityResult } from '@/types/interfaces';
import api from '../api';

export const checkItemAvailability = async (
  productId: string,
  requestedQuantity: number,
  variantId?: number
): Promise<AvailabilityResult> => {
  try {
    const product = await api.getProductById(productId);
    if (!product || !product.masterData.current) {
      return { available: false, message: 'Product not found' };
    }

    const masterVariant = product.masterData.current.masterVariant;
    const variants = product.masterData.current.variants || [];

    const variant =
      variantId === masterVariant.id || !variantId
        ? masterVariant
        : variants.find((v) => v.id === variantId);

    if (!variant) {
      return { available: false, message: 'Variant not found' };
    }

    if (!variant.availability) {
      return { available: false, message: 'Availability data not available' };
    }

    const availableQty = variant.availability.availableQuantity ?? 0;
    const isOnStock = variant.availability.isOnStock ?? false;

    if (!isOnStock) {
      return { available: false, message: 'Product is out of stock' };
    }

    if (availableQty < requestedQuantity) {
      return {
        available: false,
        message: `Only ${availableQty} items available`,
        availableQuantity: availableQty,
      };
    }

    return { available: true, availableQuantity: availableQty };
  } catch (error) {
    console.error('Availability check error:', error);
    return { available: false, message: 'Availability check failed' };
  }
};
