// import { Link } from 'react-router-dom';
import './home.css';
import { useState } from 'react';
import api from '@/api/api';
// import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  // const navigate = useNavigate();
  const [isAuthenticated] = useState(api.loginned);
  return (
    <div className="page-container">
      <main className="main-content">
        <h1 className="welcome-title">Welcome to our service</h1>
        <p className="welcome-text">
          {isAuthenticated
            ? "You're successfully logged in!"
            : 'Please sign in or register to continue'}
        </p>
      </main>
    </div>
  );
};

export default HomePage;
