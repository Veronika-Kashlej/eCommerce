import {
  ClientResponse,
  Customer,
  CustomerSignInResult,
  CustomerPagedQueryResponse,
  Address,
} from '@commercetools/platform-sdk';

export type registeredResponseMessage =
  | Array<{ detailedErrorMessage: string; code: string; error: string; message: string }>
  | string;

export interface CustomerResponse {
  response?: ClientResponse<Customer>;
  success: boolean;
  message: string;
}

export interface CustomerSignInResponse {
  response?: ClientResponse<CustomerSignInResult>;
  success: boolean;
  message: string;
}

export interface CustomerRegistrationResponse {
  response?: ClientResponse<CustomerSignInResult>;
  registered: boolean;
  message: registeredResponseMessage;
}

export interface CustomerQueryResponse {
  response?: ClientResponse<CustomerPagedQueryResponse>;
  found: boolean;
  message: string;
  id?: string;
}

export interface CustomerUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  addresses?: {
    action: 'addAddress' | 'changeAddress' | 'removeAddress';
    addressId?: string;
    address?: Address;
  };
  defaultShippingAddress?: string;
  defaultBillingAddress?: string;
}

export interface ProductsQueryArgs {
  limit?: number;
  offset?: number;
  where?: string | string[];
  expand?: string | string[];
  sort?: string | string[];
  staged?: boolean;
  priceCurrency?: string;
  priceCountry?: string;
  priceCustomerGroup?: string;
  priceChannel?: string;
  localeProjection?: string;
  storeProjection?: string;
}

export type QueryParam = string | number | boolean | string[] | number[] | boolean[] | undefined;

export interface ProductProjectionSearchArgs {
  limit?: number;
  offset?: number;
  staged?: boolean;
  'text.en'?: string;
  fuzzy?: boolean;
  fuzzyLevel?: number;
  markMatchingVariants?: boolean;
  filter?: string | string[];
  'filter.query'?: string | string[];
  facet?: string | string[];
  'filter.facets'?: string | string[];
  sort?: string | string[];
  expand?: string | string[];
  priceCurrency?: string;
  priceCountry?: string;
  priceCustomerGroup?: string;
  priceChannel?: string;
  storeProjection?: string;
  searchTerm?: string;
}
export interface ChangePasswordResult {
  success: boolean;
  message: string;
  response?: ClientResponse<Customer>;
}
