import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LazyImage from '../components/LazyImage';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/news/public');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main className="news-main">
          <p className="news-loading-text">Загрузка новостей...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Новости | Пилот Авто</title>
        <meta name="description" content="Новости автосервиса" />
        <meta property="og:title" content="Новости автосервиса" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.ru/news" />
      </Helmet>

      <Header />
      <main className="news-main">
        <div className="section-content">
          <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Новости</h1>

          {news.length > 0 ? (
            <div className="grid">
              {news.map(item => (
                <article key={item.id} className="card">
                  {item.image_url && (
                    <LazyImage
                      src={item.image_url}
                      alt={item.title}
                      className="card-image"
                    />
                  )}
                  <h3>{item.title}</h3>
                  <p>
                    {item.content?.length > 200
                      ? item.content.substring(0, 200) + '...'
                      : item.content}
                  </p>
                  <small className="news-small-date">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : ''}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <p className="news-empty-message">
              Пока новостей нет.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;