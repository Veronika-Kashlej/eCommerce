import './page404.css';
import { useNavigate } from 'react-router-dom';

const Page404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page404__container">
      <div className="page404__content">
        <h1 className="page404__content_title">404</h1>
        <h2 className="page404__content_subtitle">Oops! Page not found</h2>
        <p className="page404__content_text">
          It seems you are lost in the space of the Internet...
        </p>
        <button className="page404__content_button" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
      <div className="page404__astronaut">👨‍🚀</div>
    </div>
  );
};

export default Page404;
