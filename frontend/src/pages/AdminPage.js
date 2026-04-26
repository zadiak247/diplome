import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SectionList from '../components/admin/SectionList';
import SectionForm from '../components/admin/SectionForm';
import NewsList from '../components/admin/NewsList';
import NewsForm from '../components/admin/NewsForm';
import UsersList from '../components/admin/UsersList';
import ServicesList from '../components/admin/ServicesList';
import ServicesForm from '../components/admin/ServicesForm';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import './AdminPage.css';

const AdminPage = () => {
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <Helmet>
        <title>Админ-панель | Пилот Авто</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <button className="hamburger" onClick={toggleMenu}>
        ☰
      </button>

      <div className={`overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

      <div className="admin-container">
        <aside className={`admin-sidebar ${isMenuOpen ? 'open' : ''}`}>
          <div>
            <h2>Админ панель</h2>
            <p>Пользователь: {user?.email}</p>
          </div>

          <nav className='admin-container-nav'>
            <ul>
              <li><Link to="sections" onClick={closeMenu}>Главная</Link></li>
              <li><Link to="news" onClick={closeMenu}>Новости</Link></li>
              <li><Link to="services" onClick={closeMenu}>Услуги</Link></li>
              <li><Link to="users" onClick={closeMenu}>Пользователи</Link></li>
            </ul>
          </nav>
          <div className='admin-container-bottom'>
            <Link to="/" onClick={closeMenu} className="home-link">
              ← На главную
            </Link>
            <button onClick={() => { logout(); closeMenu(); }} className="logout-btn">
              Выйти
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <Routes>
            <Route index element={<Navigate to="sections" />} />
            <Route path="sections" element={<SectionList />} />
            <Route path="new" element={<SectionForm />} />
            <Route path="edit/:id" element={<SectionForm />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/new" element={<NewsForm />} />
            <Route path="news/edit/:id" element={<NewsForm />} />
            <Route path="services" element={<ServicesList />} />
            <Route path="services/new" element={<ServicesForm />} />
            <Route path="services/edit/:id" element={<ServicesForm />} />
            <Route path="users" element={<UsersList />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default AdminPage;