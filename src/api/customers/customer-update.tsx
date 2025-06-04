import { ByProjectKeyRequestBuilder, MyCustomerUpdateAction } from '@commercetools/platform-sdk';
import { CustomerResponse, CustomerUpdateData } from '../interfaces/types';
import {
  createSetFirstNameAction,
  createSetLastNameAction,
  createChangeEmailAction,
  createSetDateOfBirthAction,
  createAddAddressAction,
  createChangeAddressAction,
  createRemoveAddressAction,
  createSetDefaultShippingAddressAction,
  createSetDefaultBillingAddressAction,
} from './customer-actions';

export async function updateCustomer(
  apiRoot: ByProjectKeyRequestBuilder | undefined,
  isLoggedIn: boolean,
  data: CustomerUpdateData
): Promise<CustomerResponse> {
  if (!apiRoot || !isLoggedIn) {
    return {
      success: false,
      message: 'User not authenticated',
    };
  }

  try {
    const currentResponse = await apiRoot.me().get().execute();
    const currentVersion = currentResponse.body.version;
    const actions: MyCustomerUpdateAction[] = [];

    if (data.firstName) {
      actions.push(createSetFirstNameAction(data.firstName));
    }

    if (data.lastName) {
      actions.push(createSetLastNameAction(data.lastName));
    }

    if (data.email) {
      actions.push(createChangeEmailAction(data.email));
    }

    if (data.dateOfBirth) {
      actions.push(createSetDateOfBirthAction(data.dateOfBirth));
    }

    if (data.addresses) {
      if (data.addresses.action === 'addAddress' && data.addresses.address) {
        actions.push(createAddAddressAction(data.addresses.address));
      } else if (
        data.addresses.action === 'changeAddress' &&
        data.addresses.addressId &&
        data.addresses.address
      ) {
        actions.push(createChangeAddressAction(data.addresses.addressId, data.addresses.address));
      } else if (data.addresses.action === 'removeAddress' && data.addresses.addressId) {
        actions.push(createRemoveAddressAction(data.addresses.addressId));
      }
    }

    if (data.defaultShippingAddress) {
      actions.push(createSetDefaultShippingAddressAction(data.defaultShippingAddress));
    }

    if (data.defaultBillingAddress) {
      actions.push(createSetDefaultBillingAddressAction(data.defaultBillingAddress));
    }

    const response = await apiRoot
      .me()
      .post({
        body: {
          version: currentVersion,
          actions,
        },
      })
      .execute();

    return {
      response,
      success: true,
      message: 'Customer updated successfully',
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
