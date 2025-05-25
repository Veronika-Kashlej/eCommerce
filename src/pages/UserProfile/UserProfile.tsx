import api from '@/api/api';
import { User } from '@/types/interfaces';
import React, { useEffect, useState } from 'react';
import WaitingModal from '@/components/waiting/Waiting';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCurrentCustomer()
      .then((res) => {
        if (res.success && res.response) {
          const customerData = res.response.body;

          setUser({
            firstName: customerData.firstName!,
            lastName: customerData.lastName!,
            dob: customerData.dateOfBirth!,
            addresses: customerData.addresses ?? [],
          });
        } else {
          setError('Не удалось получить данные пользователя');
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Ошибка при загрузке данных:', err);
        setError('Ошибка при загрузке данных');
        setLoading(false);
      });
  }, []);

  if (loading) return <WaitingModal isOpen={true} />;
  if (error) return <p>{error}</p>;
  if (!user) return null;

  const billingAddress = user.addresses.find((addr) => addr.defaultBilling);
  const shippingAddress = user.addresses.find((addr) => addr.defaultShipping);
  const otherAddresses = user.addresses.filter(
    (addr) => addr !== billingAddress && addr !== shippingAddress
  );

  return (
    <div className="wrapper">
      <section className="first_section">
        <h1>Личная информация</h1>
        <p>
          <strong>Имя:</strong> {user.firstName} {user.lastName}
        </p>
        {user.dob && (
          <p>
            <strong>Дата рождения:</strong> {user.dob}
          </p>
        )}
      </section>

      <section>
        <h2>Адреса пользователя</h2>

        {billingAddress && (
          <div className="billingAddress__wrapper">
            <h3>Адрес для выставления счетов (по умолчанию)</h3>
            <p>
              {billingAddress.streetName}, {billingAddress.city}
            </p>
            <p>{billingAddress.postalCode}</p>
            <p>{billingAddress.country}</p>
          </div>
        )}

        {shippingAddress && (
          <div className="shippingAddress__wrapper">
            <h3>Адрес доставки (по умолчанию)</h3>
            <p>
              {shippingAddress.streetName}, {shippingAddress.city}
            </p>
            <p>{shippingAddress.postalCode}</p>
            <p>{shippingAddress.country}</p>
          </div>
        )}

        {otherAddresses.length > 0 && (
          <div>
            <h3>Другие адреса</h3>
            {otherAddresses.map((addr) => (
              <div key={addr.id} className="otherAddresses__wrapper">
                <p>
                  {addr.streetName}, {addr.city}
                </p>
                <p>{addr.postalCode}</p>
                <p>{addr.country}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
