// import { StrictMode } from 'react';  TODO - уточнить необходимость strictmode
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <HashRouter>
    <App />
  </HashRouter>
  // </StrictMode>
);
