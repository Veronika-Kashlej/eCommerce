import api from '@/api/api';
import { Address, User } from '@/types/interfaces';
import React, { useEffect, useState } from 'react';
import WaitingModal from '@/components/waiting/Waiting';
import './UserProfile.css';
import { useNavigate } from 'react-router-dom';
import ModalWindow from './ModalWindow';
import EditForm from './EditForm';
import { CustomerResponse, CustomerUpdateData } from '@/api/interfaces/types';
import ChangePasswordForm from './ChangePasswordForm';
//import { CountryLabels } from '@/types/enums';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [billingAddresses, setBillingAddresses] = useState<Address[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [otherAddresses, setOtherAddresses] = useState<Address[]>([]);

  const [defaultBillingAddr, setDefaultBillingAddr] = useState<Address | undefined>(undefined);
  const [defaultShippingAddr, setDefaultShippingAddr] = useState<Address | undefined>(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'personal' | 'address'>('personal');
  const [editData, setEditData] = useState<User | Address | null>(null);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  const [emailError, setEmailError] = useState<string>('');
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const [addressChangedTrigger, setAddressChangedTrigger] = useState<boolean>(false);

  // useEffect(() => {
  //   console.log('Обновленный user:', user);
  // }, [user]);

  // if (currentAddress) {
  //   console.log();
  // }

  useEffect(() => {
    if (!api.loginned) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    api
      .getCurrentCustomer()
      .then((res) => {
        //console.log(res.success); // проверка
        //console.log(res.response);

        if (res.success && res.response) {
          const customerData = res.response.body;

          console.log(customerData); //проверка

          const addresses = customerData.addresses ?? [];
          const billingAddressIds = customerData.billingAddressIds ?? [];
          const shippingAddressIds = customerData.shippingAddressIds ?? [];

          const getAddressById = (id: string | undefined) => {
            if (!id) return undefined;
            return addresses.find((addr) => addr.id === id);
          };

          setDefaultBillingAddr(getAddressById(customerData.defaultBillingAddressId));
          setDefaultShippingAddr(getAddressById(customerData.defaultShippingAddressId));

          const billingAddresses = billingAddressIds
            .map((id) => customerData.addresses.find((addr) => addr.id === id))
            .filter((addr): addr is Address => addr !== undefined);

          const shippingAddresses = shippingAddressIds
            .map((id) => customerData.addresses.find((addr) => addr.id === id))
            .filter((addr): addr is Address => addr !== undefined);

          const usedIds = new Set([...billingAddressIds, ...shippingAddressIds]);

          const otherAddrs = addresses.filter(
            (addr) => addr.id !== undefined && !usedIds.has(addr.id)
          );

          setUser({
            firstName: customerData.firstName!,
            lastName: customerData.lastName!,
            dateOfBirth: customerData.dateOfBirth!,
            addresses: addresses,
          });
          setBillingAddresses(billingAddresses);
          setShippingAddresses(shippingAddresses);
          setOtherAddresses(otherAddrs);
        } else {
          setError('User data is not available or user is not registered');
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Error loading data:', err);
        setError('Error loading data');
        setLoading(false);
      });
  }, []);

  const showMessage = (text: string) => {
    setMessageText(text);
    setMessageModalOpen(true);
  };
  const handleCloseMessage = () => {
    setMessageModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleCloseMessage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenModal = (mode: 'personal' | 'address', address?: Address) => {
    setModalMode(mode);
    if (mode === 'personal') {
      if (user) {
        setEditData({
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth,
          email: user.email,
          password: '',
        });
      }
    } else if (address) {
      setCurrentAddress(address);
      setEditData({ ...address });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (mode: 'personal' | 'address') => {
    let response: CustomerResponse;
    let temp: CustomerUpdateData;

    if (mode === 'personal') {
      temp = {
        firstName: editData?.firstName,
        lastName: editData?.lastName,
        dateOfBirth: editData?.dateOfBirth,
        email: editData?.email,
      };

      response = await api.updateCustomer(temp);
      localChanges();
    }

    if (mode === 'address' && currentAddress && editData && currentAddress.id) {
      temp = {
        addresses: {
          action: 'changeAddress',
          addressId: currentAddress.id,
          address: {
            streetName: (editData as Address)?.streetName,
            city: (editData as Address)?.city,
            postalCode: (editData as Address)?.postalCode,
            country: (editData as Address).country,
          },
        },
      };
      response = await api.updateCustomer(temp);
      localChanges();
      console.log(`response: ${response}`);
      setAddressChangedTrigger((prev) => !prev);
    }

    // Open new address by button "New address"
    if (mode === 'address') {
      // const newAddress: Address = {
      temp = {
        addresses: {
          action: 'addAddress',
          address: {
            id: '',
            streetName: (editData as Address).streetName,
            city: (editData as Address).city,
            postalCode: (editData as Address).postalCode,
            country: (editData as Address).country,
            // country: CountryLabels,
          },
        },
      };

      //const response = await api.addAddress(newAddress);
      response = await api.updateCustomer(temp);
      // if (response.success && response.response?.body.addresses) {
      //   setUser((prev) => {
      //     if (!prev) return prev;
      //     return {
      //       ...prev,
      //       addresses: [...prev.addresses, ...response.response.body.addresses],
      //     };
      //   });
      //   setAddressChangedTrigger((prev) => !prev);
      // }
    }

    async function localChanges(): Promise<void> {
      if (response.success) {
        // обновляем локальное состояние
        if (mode === 'personal') {
          if (editData && editData?.firstName && editData?.lastName && editData.dateOfBirth) {
            setUser((prev) => {
              return prev
                ? {
                    ...prev,
                    firstName: editData!.firstName as string,
                    lastName: editData!.lastName as string,
                    dateOfBirth: (editData as User)!.dateOfBirth,
                  }
                : prev;
            });
          }
        } else if (mode === 'address') {
          // обновляем список адресов

          setUser((prev) => {
            console.log('user: ', user);
            //if (!prev || !prev.addresses) return prev;
            console.log('addresses:', JSON.stringify(currentAddress?.streetName, null, 2)); //!!!!!!!!!!!!!!
            const updatedAddresses = prev?.addresses?.map((addr) =>
              addr.id === currentAddress?.id ? { ...addr, ...editData } : addr
            );
            // const updatedAddresses = prev.addresses
            //   ? prev.addresses.map((addr) =>
            //       addr.id === currentAddress?.id ? { ...addr, ...editData } : addr
            //     )
            //   : [];
            console.log('prev: ', prev); //!!!!!!!!!!!
            console.log(updatedAddresses); //!!!!!!!!!!!!!!!!
            console.log('end: ', prev ? { ...prev!, addresses: updatedAddresses } : prev); //!!!!
            return prev ? { ...prev!, addresses: updatedAddresses } : prev;
          });
        }
        showMessage('Data updated successfully');
        setAddressChangedTrigger((prev) => !prev); //!!!!!!!!!!!!!!!!!!!!
      } else {
        showMessage('Error updating data');
      }
    }
    setIsModalOpen(false);
  };

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  useEffect(() => {
    console.log('Адрес изменился, триггер сработал');
  }, [addressChangedTrigger]);

  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleDeleteAddress = (addressId: string) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this address?',
      onConfirm: async () => {
        setConfirmDialog(null);
        const response = await api.updateCustomer({
          addresses: {
            action: 'removeAddress',
            addressId: addressId,
          },
        });
        if (response.success) {
          setUser((prev) => {
            if (!prev || !prev.addresses) return prev;
            return {
              ...prev,
              addresses: prev.addresses.filter((addr) => addr.id !== addressId),
            };
          });
          setAddressChangedTrigger((prev) => !prev);
        }
      },
    });
  };

  const handleSetDefaultAddress = (addressId: string, type: 'billing' | 'shipping') => {
    setConfirmDialog({
      message: `Назначить этот адрес как ${type === 'billing' ? 'billing' : 'shipping'}?`,
      onConfirm: async () => {
        setConfirmDialog(null);

        //const addr = prev.addresses.find((a) => a.id === addressId);
        const response = await api.updateCustomer({
          addresses: {
            action: 'changeAddress',
            addressId: addressId,
            address: {
              streetName: addr.streetName,
              city: addr.city,
              postalCode: addr.postalCode,
              country: addr.country,
            },
          },

          defaultBillingAddress: type === 'billing' ? addressId : undefined,
          defaultShippingAddress: type === 'shipping' ? addressId : undefined,
        });

        if (response.success) {
          console.log('Done'); //!!!!!!!!!  проверка

          setUser((prev) => {
            if (!prev || !prev.addresses) return prev;
            const updatedAddresses = prev.addresses.map((addr) => ({
              ...addr,
              defaultBilling: type === 'billing' && addr.id === addressId,
              defaultShipping: type === 'shipping' && addr.id === addressId,
            }));
            return { ...prev, addresses: updatedAddresses };
          });
          setAddressChangedTrigger((prev) => !prev);
        }
      },
    });
  };

  if (loading) return <WaitingModal isOpen={true} />;
  if (error) return <p>{error}</p>;
  if (!user) return null;

  return (
    <div className="wrapper">
      <section className="first_section">
        <h1>Personal information</h1>
        <p>
          <strong className="name">First Name / Second Name:</strong> {user.firstName}
          {' / '}
          {user.lastName}
        </p>
        {user.dateOfBirth && (
          <p>
            <strong>Date of birth:</strong> {user.dateOfBirth}
          </p>
        )}
        <div className="edit__button_wrapper">
          <button className="edit_button" onClick={() => handleOpenModal('personal')}>
            Edit
          </button>
          <button className="edit_button" onClick={() => setPasswordModalOpen(true)}>
            Edit password
          </button>
        </div>

        {isPasswordModalOpen && (
          <ModalWindow onClose={() => setPasswordModalOpen(false)}>
            <ChangePasswordForm onClose={() => setPasswordModalOpen(false)} />
          </ModalWindow>
        )}
      </section>

      <section>
        <h2 className="addresses-container">Customer addresses:</h2>

        <button
          className="edit_button"
          onClick={() => {
            setCurrentAddress(null);
            setEditData({ streetName: '', city: '', postalCode: '', country: '' });
            setModalMode('address');
            setIsModalOpen(true);
          }}
        >
          New address
        </button>

        <h3>Shipping addresses</h3>
        {shippingAddresses.length > 0 ? (
          shippingAddresses.map((addr) => (
            <div
              key={addr.id}
              className={`address ${addr.id === defaultShippingAddr?.id ? 'default' : ''}`}
            >
              <p>
                {addr.streetName}, {addr.city}
              </p>
              <p>{addr.postalCode}</p>
              <p>{addr.country}</p>
              <button
                className="edit_button address_btn"
                onClick={() => handleOpenModal('address', addr)}
              >
                Edit
              </button>
              <button
                className="edit_button address_btn"
                onClick={() => addr.id && handleDeleteAddress(addr.id)}
              >
                Delete
              </button>
              <button
                className="edit_button address_btn"
                onClick={() => addr.id && handleSetDefaultAddress(addr.id, 'shipping')}
              >
                Назначить как shipping
              </button>
              {addr.id === defaultShippingAddr?.id && (
                <span className="default-label">Default shipping address</span>
              )}
            </div>
          ))
        ) : (
          <p>shipping addresses ar'nt registered</p>
        )}

        <div className="zone-divider"></div>

        <h3>Billing addresses</h3>
        {billingAddresses.length > 0 ? (
          billingAddresses.map((addr) => (
            <div
              key={addr.id}
              className={`address ${addr.id === defaultBillingAddr?.id ? 'default' : ''}`}
            >
              <p>
                {addr.streetName}, {addr.city}
              </p>
              <p>{addr.postalCode}</p>
              <p>{addr.country}</p>
              <button
                className="edit_button address_btn"
                onClick={() => handleOpenModal('address', addr)}
              >
                Edit
              </button>
              <button
                className="edit_button address_btn"
                onClick={() => addr.id && handleDeleteAddress(addr.id)}
              >
                Delete
              </button>
              <button
                className="edit_button address_btn"
                onClick={() => addr.id && handleSetDefaultAddress(addr.id, 'billing')}
              >
                Назначить как billing
              </button>
              {addr.id === defaultBillingAddr?.id && (
                <span className="default-label">Default billing address</span>
              )}
            </div>
          ))
        ) : (
          <p>billing addresses ar'nt registered</p>
        )}

        <div className="zone-divider"></div>

        <h3>Other Addresses</h3>
        {otherAddresses.length > 0 ? (
          otherAddresses.map((addr) => (
            <div key={addr.id} className="address">
              <p>
                {addr.streetName}, {addr.city}
              </p>
              <p>{addr.postalCode}</p>
              <p>{addr.country}</p>
              <button
                className="edit_button address_btn"
                onClick={() => handleOpenModal('address', addr)}
              >
                Edit
              </button>
              <button
                className="edit_button address_btn"
                onClick={() => addr.id && handleDeleteAddress(addr.id)}
              >
                Delete
              </button>
              <button
                className="edit_button address_btn"
                onClick={() => addr.id && handleSetDefaultAddress(addr.id, 'shipping')}
              >
                Назначить как shipping
              </button>
              <button
                className="edit_button address_btn"
                onClick={() => addr.id && handleSetDefaultAddress(addr.id, 'billing')}
              >
                Назначить как billing
              </button>
            </div>
          ))
        ) : (
          <p>No other addresses</p>
        )}
      </section>
      {isModalOpen && (
        <ModalWindow onClose={() => setIsModalOpen(false)}>
          <EditForm<User | Address>
            mode={modalMode}
            data={editData!}
            onChange={(data: User | Address) => setEditData(data)}
            onSave={handleSave}
            setEmailError={setEmailError}
            emailError={emailError}
          />
        </ModalWindow>
      )}
      {messageModalOpen && (
        <ModalWindow onClose={handleCloseMessage}>
          <div className="handleMessage_wrap">
            <p>{messageText}</p>
            <button className="edit_button" onClick={handleCloseMessage}>
              OK
            </button>
          </div>
        </ModalWindow>
      )}
      {confirmDialog && (
        <ModalWindow onClose={() => setConfirmDialog(null)}>
          <div style={{ padding: '20px' }}>
            <p>{confirmDialog.message}</p>
            <button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(null);
              }}
            >
              Yes
            </button>
            <button onClick={() => setConfirmDialog(null)}>No</button>
          </div>
        </ModalWindow>
      )}
    </div>
  );
};

export default UserProfile;
