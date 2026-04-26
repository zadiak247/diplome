import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/news');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить новость?')) {
      try {
        await api.delete(`/news/${id}`);
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  if (loading) return <div>Загрузка новостей...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Новости</h2>
        <Link to="/manage-a1b2c3/news/new" className="btn btn-success">
          + Добавить новость
        </Link>
      </div>
      {news.length === 0 ? (
        <p>Новостей пока нет.</p>
      ) : (
        news.map(item => (
          <div key={item.id} className="section-item">
            <div className="section-info">
              <div className="section-main-row">
                <h4 className="section-title">{item.title}</h4>
                <span style={{ color: '#666', marginLeft: '10px' }}>
                  {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <p className="section-meta" style={{ marginTop: '5px', fontSize: '0.85rem' }}>
                Создал: {item.created_by_email || '—'} &nbsp;|&nbsp;
                Обновил: {item.updated_by_email || '—'}
              </p>
            </div>
            <div className="section-actions">
              <Link to={`/manage-a1b2c3/news/edit/${item.id}`} className="btn btn-primary">
                Ред.
              </Link>
              <button onClick={() => handleDelete(item.id)} className="btn btn-danger">
                Удалить
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NewsList;