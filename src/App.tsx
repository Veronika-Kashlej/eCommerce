// import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/login/Login';
import HomePage from './pages/home/home';
import Registration from './pages/registration/Registration';
import Page404 from '../src/pages/page404/page404';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/error404" element={<Page404 />} />
        {/* <Route path="*" element={<Page404 />} /> */}
        {/* TODO - поменять на этот вариант что бы сохрать URL текущей страницы Задание #50 
        и отображении несуществующего адреса*/}
      </Routes>
    </>
  );
}

export default App;
