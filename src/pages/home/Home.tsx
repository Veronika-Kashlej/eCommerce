import { useEffect } from 'react';
import './Home.css';
import ProductList from '@/components/products-list/Products-list';

const HomePage: React.FC = () => {
  useEffect(() => {
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);
  return (
    <div className="page-container">
      <main className="main-content">
        <ProductList />
      </main>
    </div>
  );
};

export default HomePage;
