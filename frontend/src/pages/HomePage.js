import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LazyImage from '../components/LazyImage';
import LazyReviews from '../components/LazyReviews';
import './HomePage.css';

const HomePage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedSections, setGroupedSections] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchSections();
    fetchNews();
    fetchServices();
  }, []);

  useEffect(() => {
    if (sections.length > 0) {
      const grouped = groupConsecutiveSections(sections);
      setGroupedSections(grouped);
    }
  }, [sections]);

  const fetchSections = async () => {
    try {
    const response = await api.get('/sections/public');
    setSections(response.data);
  } catch (error) {
    console.error('Error fetching sections:', error);
  } finally {
    setLoading(false);
  }
  };

  const fetchNews = async () => {
    try {
      const response = await api.get('/news/public?limit=6');
      setLatestNews(response.data);
    } catch (error) {
      console.error('Error fetching latest news:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/public?limit=6');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
};

  const groupConsecutiveSections = (sections) => {
    if (sections.length === 0) return [];
    const groups = [];
    const SPECIAL_TYPES = ['news_block', 'reviews_block', 'services_block'];
    let currentGroup = null;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const isSpecial = SPECIAL_TYPES.includes(section.type);

      if (isSpecial) {
        if (currentGroup && !SPECIAL_TYPES.includes(currentGroup.type)) {
          groups.push(currentGroup);
          currentGroup = null;
        }
        groups.push({ type: section.type, sections: [section] });
        continue;
      }

      if (!currentGroup) {
        currentGroup = { type: section.type, sections: [section] };
      } else if (section.type === currentGroup.type) {
        currentGroup.sections.push(section);
      } else {
        groups.push(currentGroup);
        currentGroup = { type: section.type, sections: [section] };
      }
    }

    if (currentGroup && !SPECIAL_TYPES.includes(currentGroup.type)) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const renderSingleSection = (section) => {
    switch (section.type) {
      case 'hero':
        return (
          <section
            key={section.id}
            className="landing-section hero-section"
            aria-labelledby="hero-heading"
          >
            <div className="hero-bg">
              {section.image_url ? (
                <img src={section.image_url} alt="" className="hero-img" />
              ) : (
                <div className="hero-img" style={{ background: '#667eea' }} />
              )}
              <div className="hero-overlay">
                <div className="hero-content">
                  <h1 id="hero-heading">{section.title}</h1>
                  <hr />
                  <p className="hero-subtitle">{section.content}</p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'content':
        return (
          <section
            key={section.id}
            className="landing-section content-section"
            aria-labelledby={`content-heading-${section.id}`}
          >
            <div className="section-content">
              <h2 id={`content-heading-${section.id}`}>{section.title}</h2>
              <p className="content-paragraph">
                {section.content}
              </p>
              {section.image_url && (
                <LazyImage
                  src={section.image_url}
                  alt={section.title}
                  className="content-image"
                />
              )}
            </div>
          </section>
        );
        case 'news_block':
          return (
            <section key={section.id} className="landing-section news-block-section">
              <div className="section-content">
                <h2>{section.title || 'Новости'}</h2>
                {latestNews.length > 0 ? (
                  <>
                    <div className="grid">
                      {latestNews.slice(0, 6).map(item => (
                        <article key={item.id} className="card">
                          {item.image_url && (
                            <LazyImage src={item.image_url} alt={item.title} />
                          )}
                          <h3>{item.title}</h3>
                          <p>
                            {item.content?.substring(0, 100)}
                            {item.content?.length > 100 ? '...' : ''}
                          </p>
                          <small>
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString('ru-RU')
                              : ''}
                          </small>
                        </article>
                      ))}
                    </div>
                    <div className="section-button-container">
                      <Link to="/news" className="btn btn-primary">
                        Все новости
                      </Link>
                    </div>
                  </>
                ) : (
                  <p style={{ textAlign: 'center' }}>Пока новостей нет.</p>
                )}
              </div>
            </section>
          );
          case 'reviews_block':
              return <LazyReviews key={section.id} title={section.title} />;
            
          case 'services_block':
            return (
              <section key={section.id} className="landing-section services-block-section">
                <div className="section-content">
                  <h2>{section.title || 'Наши услуги'}</h2>
                  {services.length > 0 ? (
                    <>
                      <div className="grid">
                        {services.slice(0, 6).map(service => (
                          <article key={service.id} className="card">
                            {service.image_url && (
                              <LazyImage src={service.image_url} alt={service.name} />
                            )}
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>
                            {service.price && (
                              <div className="service-price">{service.price} ₽</div>
                            )}
                          </article>
                        ))}
                      </div>
                      <div className="section-button-container">
                        <Link to="/services" className="btn btn-primary">
                          Все услуги
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p style={{ textAlign: 'center' }}>Информация об услугах скоро появится.</p>
                  )}
                </div>
              </section>
            );
      default:
        return null;
    }
  };

  const renderSectionGroup = (group) => {
    if (group.sections.length === 1) {
      return renderSingleSection(group.sections[0]);
    }

    return (
      <section
        key={`group-${group.type}-${group.sections[0].id}`}
        id={`group-${group.type}`}
        className={`landing-section ${group.type}-section group-section`}
        aria-label={`Группа секций типа ${group.type}`}
      >
        <div className="section-content">
          <div className="sections-group-container">
            {group.sections.map((section) => (
              <article key={section.id} className={`${group.type}-item section-in-group`}>
                <h2>{section.title}</h2>
                <p>{section.content}</p>
                {section.image_url && (
                  <div className="image-container">
                    <LazyImage
                      src={section.image_url}
                      alt={section.title || 'Изображение'}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main>
          <p className="loading-text">Загрузка...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Пилот Авто</title>
        <meta name="description" content="Качественный ремонт и техническое обслуживание автотранспортных средств. Быстро, надёжно, с гарантией." />
        <meta property="og:title" content="Пилот Авто" />
        <meta property="og:description" content="Качественный ремонт и ТО автотранспортных средств" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.ru/" />
        <meta property="og:image" content="https://yourdomain.ru/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />
      <main style={{ paddingTop: '120px' }}>
        {groupedSections.map(renderSectionGroup)}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;