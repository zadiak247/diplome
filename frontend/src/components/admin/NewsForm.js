import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const NewsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    is_published: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/news/${id}`).then(res => setFormData(res.data)).catch(console.error);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    try {
      const response = await api.post('/upload', formDataUpload);
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Введите заголовок' });
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/news/${id}`, formData);
        setMessage({ type: 'success', text: 'Новость обновлена' });
        setTimeout(() => navigate('/manage-a1b2c3/news'), 500);
      } else {
        await api.post('/news', formData);
        setMessage({ type: 'success', text: 'Новость создана' });
        setTimeout(() => navigate('/manage-a1b2c3/news'), 500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-form">
      <h2>{isEdit ? 'Редактировать новость' : 'Новая новость'}</h2>
      {message && <div className={message.type === 'error' ? 'error' : 'success'}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Заголовок</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Содержание</label>
          <textarea name="content" value={formData.content} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Изображение URL</label>
          <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} />
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: '10px' }} />
          {formData.image_url && <img src={formData.image_url} alt="preview" style={{ maxWidth: '200px', marginTop: '10px' }} />}
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} />
            Опубликовано
          </label>
        </div>
        <div className="buttons-row">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
          </button>
          <button type="button" onClick={() => navigate('/manage-a1b2c3/news')} className="btn btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;