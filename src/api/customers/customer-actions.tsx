import {
  MyCustomerSetFirstNameAction,
  MyCustomerSetLastNameAction,
  MyCustomerChangeEmailAction,
  MyCustomerSetDateOfBirthAction,
  MyCustomerAddAddressAction,
  MyCustomerChangeAddressAction,
  MyCustomerRemoveAddressAction,
  MyCustomerSetDefaultShippingAddressAction,
  MyCustomerSetDefaultBillingAddressAction,
  Address,
} from '@commercetools/platform-sdk';

export const createSetFirstNameAction = (firstName: string): MyCustomerSetFirstNameAction => ({
  action: 'setFirstName',
  firstName,
});

export const createSetLastNameAction = (lastName: string): MyCustomerSetLastNameAction => ({
  action: 'setLastName',
  lastName,
});

export const createChangeEmailAction = (email: string): MyCustomerChangeEmailAction => ({
  action: 'changeEmail',
  email,
});

export const createSetDateOfBirthAction = (
  dateOfBirth: string
): MyCustomerSetDateOfBirthAction => ({
  action: 'setDateOfBirth',
  dateOfBirth,
});

export const createAddAddressAction = (address: Address): MyCustomerAddAddressAction => ({
  action: 'addAddress',
  address,
});

export const createChangeAddressAction = (
  addressId: string,
  address: Address
): MyCustomerChangeAddressAction => ({
  action: 'changeAddress',
  addressId,
  address,
});

export const createRemoveAddressAction = (addressId: string): MyCustomerRemoveAddressAction => ({
  action: 'removeAddress',
  addressId,
});

export const createSetDefaultShippingAddressAction = (
  addressId: string
): MyCustomerSetDefaultShippingAddressAction => ({
  action: 'setDefaultShippingAddress',
  addressId,
});

export const createSetDefaultBillingAddressAction = (
  addressId: string
): MyCustomerSetDefaultBillingAddressAction => ({
  action: 'setDefaultBillingAddress',
  addressId,
});
