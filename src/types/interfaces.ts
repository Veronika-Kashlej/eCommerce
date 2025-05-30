import { Country } from './enums';
import { Address as CtAddress } from '@commercetools/platform-sdk';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface IFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  dob: string;
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
  dob: string;
  addresses?: Address[];
}

export interface Address extends CtAddress {
  Billing?: boolean;
  defaultBilling?: boolean;
  defaultShipping?: boolean;
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
}

export type CustomerUpdateCustomerAction =
  | { action: 'setFirstName'; firstName: string }
  | { action: 'setLastName'; lastName: string }
  | { action: 'setDateOfBirth'; dateOfBirth: string }
  | { action: 'changeAddress'; addressId: string; address: Address }
  | { action: 'addAddress'; address: Address }
  | { action: 'removeAddress'; addressId: string }
  | { action: 'setDefaultShippingAddress'; addressId: string }
  | { action: 'setDefaultBillingAddress'; addressId: string };

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
