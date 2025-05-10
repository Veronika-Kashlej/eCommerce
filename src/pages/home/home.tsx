import { Link } from 'react-router-dom';
import './home.css';
import { useState } from 'react';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated] = useState(api.loginned);
  function logout() {
    api.logout();
    navigate('/login');
  }
  return (
    <div className="page-container">
      <header className="header">
        <nav className="nav">
          {!isAuthenticated ? (
            <div className="auth-links">
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </div>
          ) : (
            <button className="logout-button" onClick={() => logout()}>
              Log Out
            </button>
          )}
        </nav>
      </header>

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
