import { Link } from 'react-router-dom';
import './Header.css';
import api from '@/api/api';
import { useNavigate } from 'react-router-dom';
import basketLogo from './logo/basket.png';
import { getCart } from '@/api/cart';
import { useEffect, useState } from 'react';

const Header: React.FC = () => {
  const [countProducts, setCountProducts] = useState(0);
  const [activePromos, setActivePromos] = useState<string[]>([]);
  const navigate = useNavigate();

  async function logout() {
    await api.logout();
    setCountProducts(0);
    navigate('/login');
  }

  useEffect(() => {
    const updateCartCount = async () => {
      const cart = (await getCart()).response;
      if (cart) setCountProducts(cart.body.lineItems.length);
    };
    const handleCartUpdate = () => {
      updateCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    updateCartCount();

    const fetchPromos = async () => {
      const { response } = await api.discountGet();
      if (response) {
        setActivePromos(response.body.results.map((c) => c.code));
      }
    };
    fetchPromos();

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <header className="header">
      <Link to="/" className="nav-link">
        Home
      </Link>

      <div className="promos-block">
        <h4>Promo codes:</h4>
        <ul>
          {activePromos.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      </div>

      <nav className="nav">
        <Link to="/about" className="nav-link">
          About us
        </Link>
        <div className="basket-container">
          <Link to="/basket" className="nav-link basket-link">
            Basket
            <img src={basketLogo} alt="basket" className="basket-icon" />
            <span className="basket-count">{countProducts}</span>
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
