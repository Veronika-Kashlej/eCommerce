import {
  ByProjectKeyRequestBuilder,
  Product,
  ProductProjection,
} from '@commercetools/platform-sdk';

export async function getProductById(
  anonymApiRoot: ByProjectKeyRequestBuilder,
  productId: string
): Promise<Product> {
  try {
    const response = await anonymApiRoot.products().withId({ ID: productId }).get().execute();
    return response.body;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function getProductProjectionById(
  anonymApiRoot: ByProjectKeyRequestBuilder,
  productId: string,
  staged: boolean = false,
  expand?: string[]
): Promise<ProductProjection | undefined> {
  try {
    const response = await anonymApiRoot
      .productProjections()
      .withId({ ID: productId })
      .get({
        queryArgs: {
          staged,
          expand,
        },
      })
      .execute();

    return response.body;
  } catch (error) {
    console.error(`Error fetching product projection with ID ${productId}:`, error);
    throw error;
  }
}
