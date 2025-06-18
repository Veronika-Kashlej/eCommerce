import React, { useEffect, useState } from 'react';
import api from '@/api/api';
import { Link } from 'react-router-dom';

const EmptyMessage: React.FC<{ onStatusChange?: (isEmpty: boolean) => void }> = ({
  onStatusChange,
}) => {
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const unsubscribe = api.subscribeToCartChanges((cartIsEmpty: boolean) => {
      setIsEmpty(cartIsEmpty);
      if (onStatusChange) {
        onStatusChange(cartIsEmpty);
      }
    });

    api.isCartEmpty().then((isEmpty: boolean) => {
      setIsEmpty(isEmpty);
      if (onStatusChange) {
        onStatusChange(isEmpty);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [onStatusChange]);

  if (!isEmpty) {
    return null;
  }

  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '1.2em',
        color: '#333',
      }}
    >
      🛒 Oops! Your bag is empty. Start shopping and add products! 🚀
      <br />
      <Link to="/" style={{ color: '#007bff', textDecoration: 'underline' }}>
        Let's go!
      </Link>
    </div>
  );
};

export default EmptyMessage;
