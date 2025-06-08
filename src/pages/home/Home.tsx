import './Home.css';
// import { useState } from 'react';
// import api from '@/api/api';
import ProductList from '@/components/products-list/Products-list';

const HomePage: React.FC = () => {
  // const [isAuthenticated] = useState(api.loginned);
  return (
    <div className="page-container">
      <main className="main-content">
        <ProductList />
      </main>
    </div>
  );
};

export default HomePage;
