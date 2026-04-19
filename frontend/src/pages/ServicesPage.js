import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import LazyImage from '../components/LazyImage';
import './ServicesPage.css';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services/public')
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="services-main">
          <p>Загрузка услуг...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Услуги | Пилот Авто</title>
        <meta name="description" content="Полный перечень услуг автосервиса: ремонт, ТО, диагностика." />
        <meta property="og:title" content="Услуги автосервиса" />
        <meta property="og:description" content="Ремонт и ТО автомобилей" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.ru/services" />
      </Helmet>

      <Header />
      <main className="services-main">
        <section className="landing-section services-section">
          <div className="section-content">
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Наши услуги</h1>
            {services.length === 0 ? (
              <p>Информация об услугах скоро появится.</p>
            ) : (
              <div className="grid">
                {services.map(service => (
                  <article key={service.id} className="card">
                    {service.image_url && (
                      <LazyImage 
                        src={service.image_url} 
                        alt={service.name} 
                        className="services-image" 
                        loading="lazy" 
                      />
                    )}
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    {service.price && (
                      <div className="service-price">{service.price} ₽</div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ServicesPage;