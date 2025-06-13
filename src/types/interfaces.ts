import { Country } from './enums';
import { Cart, ClientResponse, Address as CtAddress } from '@commercetools/platform-sdk';
import { ProductProjection } from '@commercetools/platform-sdk';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface IFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  dateOfBirth: string;
  shippingStreet: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: Country;
  billingStreet: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: Country;
}

export type PostalCodePatterns = {
  [key in Country]: RegExp;
};

export const postalCodePatterns: PostalCodePatterns = {
  [Country.EMPTY]: /^\d{0}$/,
  [Country.BY]: /^\d{6}$/,
  [Country.RU]: /^\d{6}$/,
  [Country.UA]: /^\d{5}$/,
  [Country.US]: /^\d{5}(-\d{4})?$/,
};

export interface User {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  addresses?: Address[];
  email?: string;
  password?: string;
}

export interface Address extends CtAddress {
  Billing?: boolean;
  defaultBilling?: boolean;
  defaultShipping?: boolean;
  dateOfBirth?: string;
}

// interface Address {
//   id: string;
//   streetName: string;
//   postalCode: string;
//   city: string;
//   country: Country; // or string?
//   defaultBilling?: boolean;
//   defaultShipping?: boolean;
// }

export interface EditFormProps<T extends User | Address> {
  mode: 'personal' | 'address';
  data: T;
  onChange: (data: T) => void;
  onSave: (mode: 'personal' | 'address') => Promise<void>;
  setEmailError?: React.Dispatch<React.SetStateAction<string>>;
  emailError?: string;
  onDeleteAddress?: (addressId: string) => Promise<void>;
  onSetDefaultAddress?: (addressId: string, type: 'billing' | 'shipping') => Promise<void>;
}

export interface Attribute {
  name: string;
}

export interface ProductImage {
  url: string;
  dimensions?: { w: number; h: number };
  label?: string;
}

export type SortState = {
  price: '' | 'asc' | 'desc';
  name: '' | 'asc' | 'desc';
  combined: boolean;
};

export interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface AddressProps {
  address: Address;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string, type: 'billing' | 'shipping') => void;
}

export interface AvailabilityResult {
  available: boolean;
  message?: string;
  availableQuantity?: number;
}

export interface CartResponse {
  response?: ClientResponse<Cart>;
  success: boolean;
  message: string;
}

export interface ProductCardProps {
  product: ProductProjection;
}
