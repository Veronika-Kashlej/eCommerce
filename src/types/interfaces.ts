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
  addresses: Address[];
}

interface Address extends CtAddress {
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
