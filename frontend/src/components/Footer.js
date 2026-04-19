import React from 'react';
import { Link } from 'react-router-dom';
import LazyMap from './LazyMap';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col footer-map-col">
          <h3>Мы на карте</h3>
            <LazyMap />
        </div>
        <div className="footer-col">
          <h3>Контакты</h3>
          <ul className="footer-contacts">
            <li>
              г. Батайск, ул. Воровского, 55
            </li>
            <li>
              <a href="tel:+79185174238" className="footer-link">
                +7 (918) 517-42-38
              </a>
            </li>
            <li>
              <a href="mailto:info@pilot-auto.ru" className="footer-link">
                info@pilot-auto.ru
              </a>
            </li>
            <li>
              Ежедневно 09:00–19:00
            </li>
          </ul>
        </div>        
      </div>
      <div className="footer-bottom">
        <p>© {currentYear} ИП Шеин А.С. Все права защищены.</p>
        <Link to="/privacy" className="footer-privacy">Политика конфиденциальности</Link>
      </div>
    </footer>
  );
};

export default Footer;