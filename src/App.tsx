// import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login/Login';
import Registration from './pages/registration/Registration';
import Page404 from './pages/page404/page404';
import HomePage from './pages/home/home';
import api from './api/api';
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    if (api.loginned && window.location.hash === '#/login') {
      navigate('/');
    }
  }, [navigate]);
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={!api.loginned ? <Login /> : <HomePage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

export default App;
