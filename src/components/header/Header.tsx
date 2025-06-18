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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <div
        className="burger"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menu"
        aria-expanded={isMenuOpen}
        role="button"
      >
        <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
        <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
        <div className={`line ${isMenuOpen ? 'open' : ''}`}></div>
      </div>

      <div className={`header-top ${isMenuOpen ? 'active' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
        </div>

        <nav className="nav">
          <div className="container">
            <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              About us
            </Link>
          </div>
          <div className="basket-container">
            <Link
              to="/basket"
              className="nav-link basket-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Basket
              <img src={basketLogo} alt="basket" className="basket-icon" />
              <span className="basket-count">{countProducts}</span>
            </Link>
          </div>
          {!api.loginned ? (
            <div className="auth-links">
              <div className="container">
                <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              </div>
              <div className="container">
                <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="container">
                <Link to="/userprofile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  User Profile
                </Link>
              </div>
              <button
                className="logout-button"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                Log Out
              </button>
            </>
          )}
        </nav>
      </div>
      <div className="header-bottom">
        <div className="promos-block">
          <h4>Promo codes:</h4>
          <ul>
            {activePromos.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
