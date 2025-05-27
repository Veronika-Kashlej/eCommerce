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
  // const billingAddress: [] = [];
  const [billingAddresses, setBillingAddresses] = useState<Address[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [otherAddresses, setOtherAddresses] = useState<Address[]>([]);

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

          //const billingAddressId = customerData.billingAddressIds;
          //console.error(billingAddressId);

          const addresses = customerData.addresses ?? [];
          const billingAddressIds = customerData.billingAddressIds ?? [];
          const shippingAddressIds = customerData.shippingAddressIds ?? [];

          const usedIds = new Set([...billingAddressIds, ...shippingAddressIds]);

          const billingAddresses = billingAddressIds
            .map((id) => customerData.addresses.find((addr) => addr.id === id))
            .filter((addr): addr is Address => addr !== undefined);

          const shippingAddresses = shippingAddressIds
            .map((id) => customerData.addresses.find((addr) => addr.id === id))
            .filter((addr): addr is Address => addr !== undefined);

          //const otherAddrs = addresses.filter((addr) => !usedIds.has(addr.id));
          const otherAddrs = addresses.filter(
            (addr) => addr.id !== undefined && !usedIds.has(addr.id)
          );

          setUser({
            firstName: customerData.firstName!,
            lastName: customerData.lastName!,
            dob: customerData.dateOfBirth!,
            //addresses: customerData.addresses ?? [],
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

  // const billingAddress = user.addresses.find((addr) => addr.defaultBilling);
  // // const billingAddress = user.addresses.find((addr) => addr.Billing);
  // const shippingAddress = user.addresses.find((addr) => addr.defaultShipping);

  // const otherAddresses = user.addresses.filter(
  //   (addr) => addr !== billingAddress && addr !== shippingAddress
  // );

  // const shippingAddress1 = user.addresses.find(
  //   (addr) => addr.custom?.fields?.addressType === 'Shipping'
  // );
  //console.error(`First: ${shippingAddress1}`);
  //console.error(`second: ${shippingAddress}`);

  return (
    <div className="wrapper">
      <section className="first_section">
        <h1>Личная информация</h1>
        <p>
          <strong className="name">Имя:</strong> {user.firstName} {user.lastName}
        </p>
        {user.dob && (
          <p>
            <strong>Дата рождения:</strong> {user.dob}
          </p>
        )}
      </section>

      <section>
        <h2 className="addresses-container">Адреса пользователя:</h2>

        <h3>Адреса для доставки</h3>
        {shippingAddresses.length > 0 ? (
          shippingAddresses.map((addr) => (
            <div key={addr.id} className="address">
              <p>
                {addr.streetName}, {addr.city}
              </p>
              <p>{addr.postalCode}</p>
              <p>{addr.country}</p>
            </div>
          ))
        ) : (
          <p>Нет адресов для доставки</p>
        )}

        <div className="zone-divider"></div>

        <h3>Адреса для выставления счетов</h3>
        {billingAddresses.length > 0 ? (
          billingAddresses.map((addr) => (
            <div key={addr.id} className="address">
              <p>
                {addr.streetName}, {addr.city}
              </p>
              <p>{addr.postalCode}</p>
              <p>{addr.country}</p>
            </div>
          ))
        ) : (
          <p>Нет адресов для выставления счетов</p>
        )}

        <div className="zone-divider"></div>

        <h3>Другие адреса</h3>
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
          <p>Нет других адресов</p>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
