import { Link } from 'react-router-dom';
import './Header.css';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';
import basketLogo from './logo/basket.png';

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

      {/* <button onClick={()=>api.cartCreate().then(r=> console.log(r))}>create cart</button> */}
      <button onClick={() => api.cartGet().then((r) => console.log(r))}>get cart</button>
      <button
        onClick={() =>
          api.cartAddItem('699a3c89-45ab-4c36-a774-4f2a3d570aea', 1).then((r) => console.log(r))
        }
      >
        add cart
      </button>
      <button
        onClick={() =>
          api.cartRemoveItems('2b4c6fce-c2a7-4cf3-9656-37ab3577aa6a').then((r) => console.log(r))
        }
      >
        rem cart
      </button>

      <nav className="nav">
        <Link to="/about" className="nav-link">
          About us
        </Link>
        <div className="basket-container">
          <Link to="/basket" className="nav-link basket-link">
            Basket
            <img src={basketLogo} alt="basket" className="basket-icon" />
            <span className="basket-count">0</span>
          </Link>
        </div>
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
          <>
            <Link to="/userprofile" className="nav-link">
              User Profile
            </Link>
            <button className="logout-button" onClick={() => logout()}>
              Log Out
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
