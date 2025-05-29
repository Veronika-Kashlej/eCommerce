import {
  ByProjectKeyRequestBuilder,
  ClientResponse,
  ProductProjectionPagedSearchResponse,
} from '@commercetools/platform-sdk';
import { ProductProjectionSearchArgs, QueryParam } from '../interfaces/types';

/**
 * Retrieves a paginated list of product projections from Commercetools using search endpoint.
 * This provides more advanced search capabilities than the regular products endpoint.
 *
 * @param {ByProjectKeyRequestBuilder} apiRoot - API root instance
 *
 * @param {ProductsQueryArgs} queryArgs - Query parameters for filtering, sorting and pagination.
 * @param {number} [queryArgs.limit=20] - Maximum number of products to return (default: 20).
 * @param {number} [queryArgs.offset=0] - Number of products to skip (for pagination).
 * @param {string|string[]} [queryArgs.where] - Query predicate in Commercetools Predicate Language.
 * @param {string|string[]} [queryArgs.expand] - References to expand (e.g., ['productType', 'taxCategory']).
 * @param {string|string[]} [queryArgs.sort] - Sort criteria (e.g., 'createdAt desc').
 * @param {boolean} [queryArgs.staged] - Whether to include staged changes (default: false).
 * @param {string} [queryArgs.priceCurrency] - Currency code for price selection.
 * @param {string} [queryArgs.priceCountry] - Country code for price selection.
 * @param {string} [queryArgs.text] - Full-text search query.
 * @param {string} [queryArgs.fuzzy] - Enable fuzzy search.
 * @param {string} [queryArgs.facet] - Facet expressions for faceted search.
 * @param {string} [queryArgs.filter] - Filter expressions for search.
 * @param {string} [queryArgs.filterQuery] - Filter query for search.
 * @param {string} [queryArgs.filterFacets] - Filter facets for search.
 *
 * @returns {Promise<ClientResponse<ProductProjectionPagedSearchResponse>|undefined>}
 *   - Returns the API response with products data if successful.
 *   - Returns undefined and logs error if the request fails.
 *
 * @throws {Error}
 *   - Throws and logs errors from Commercetools API (network issues, invalid queries etc.)
 *
 * @example
 *  Full-text search for products
 *
 * getProductsList({
 *   text: 'red shoes',
 *   fuzzy: true,
 *   limit: 10
 * });
 *
 * @example
 *  Faceted search with filters
 *
 * getProductsList({
 *   facet: ['variants.attributes.color', 'variants.attributes.size'],
 *   filter: ['variants.price.centAmount:range (1000 to 2000)'],
 *   filterQuery: ['variants.attributes.color:"red"']
 * });
 */
export async function getProductsList(
  apiRoot: ByProjectKeyRequestBuilder,
  queryArgs?: ProductProjectionSearchArgs
): Promise<ClientResponse<ProductProjectionPagedSearchResponse> | undefined> {
  console.log('Original queryArgs:', queryArgs);
  try {
    const preparedQueryArgs: Record<string, QueryParam> = {
      limit: 20,
      offset: 0,
      fuzzy: true,
      fuzzyLevel: 1,
      staged: false,
      ...queryArgs,
      ...(queryArgs?.searchTerm ? { 'text.en-US': `${queryArgs.searchTerm}*` } : {}),
    };

    Object.keys(preparedQueryArgs).forEach((key) => {
      if (preparedQueryArgs[key] === undefined || key === 'searchTerm') {
        delete preparedQueryArgs[key];
      }
    });

    console.log('Prepared queryArgs:', preparedQueryArgs);

    const response = await apiRoot
      .productProjections()
      .search()
      .get({
        queryArgs: preparedQueryArgs,
      })
      .execute();

    console.log(`Found ${response.body.results.length} products`);
    return response;
  } catch (error) {
    console.error('Search failed:', {
      error,
      queryArgs,
    });
    throw error;
  }
}
