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
