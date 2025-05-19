import { Link } from 'react-router-dom';
import './Header.css';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  async function logout() {
    await api.logout();
    navigate('/login');
  }
  return (
    <header className="header">
      <Link to="/" className="nav-link">
        Home
      </Link>

      <nav className="nav">
        {!api.loginned ? (
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
  );
};

export default Header;
