import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <img src={'/images/logo.png'} className="logo" alt="Логотип" />
      
      <button className={`burger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <NavLink to="/" end onClick={closeMenu}>главная</NavLink>
        <NavLink to="/news" onClick={closeMenu}>новости</NavLink>
        <NavLink to="/services" onClick={closeMenu}>услуги</NavLink>
      </nav>

      <a href="tel:+79185174238" className="phone">+7 (918) 517-42-38</a>
    </header>
  );
};

export default Header;