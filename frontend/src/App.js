import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/portal-d8f3a2" element={<LoginPage />} />
              <Route path="/manage-a1b2c3/*" element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              } />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;