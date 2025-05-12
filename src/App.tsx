// import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/login/Login';
import Registration from './pages/registration/Registration';
import Page404 from './pages/page404/page404';
import HomePage from './pages/home/home';
import api from './api/api';

function App() {
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
