import api from '@/api/api';
import { Address, User } from '@/types/interfaces';
import React, { useEffect, useState } from 'react';
import WaitingModal from '@/components/waiting/Waiting';
import './UserProfile.css';
import { useNavigate } from 'react-router-dom';

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

          // const defaultBillingId = customerData.defaultBillingAddressId;
          // const defaultShippingId = customerData.defaultShippingAddressId;

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

          // const defaultBillingAddress = getAddressById(defaultBillingId);
          // const defaultShippingAddress = getAddressById(defaultShippingId);

          setUser({
            firstName: customerData.firstName!,
            lastName: customerData.lastName!,
            dob: customerData.dateOfBirth!,
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
        {user.dob && (
          <p>
            <strong>Date of birth:</strong> {user.dob}
          </p>
        )}
      </section>

      <section>
        <h2 className="addresses-container">Customer addresses:</h2>

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
            </div>
          ))
        ) : (
          <p>No other addresses</p>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
