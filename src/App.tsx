// import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/login/Login';
import HomePage from './pages/home/Home';
import Registration from './pages/registration/Registration';
import Page404 from './pages/page404/Page404';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

export default App;
