import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SectionForm.css';

const SectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    type: 'hero',
    title: '',
    content: '',
    image_url: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchSection();
    }
  }, [id]);

  const fetchSection = async () => {
    try {
      const response = await api.get(`/sections/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching section:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? e.target.checked : value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    try {
      const response = await api.post('/upload', uploadFormData);
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const allowedTypes = ['hero', 'content', 'news_block', 'reviews_block', 'services_block'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allowedTypes.includes(formData.type)) {
      setMessage({ type: 'error', text: 'Недопустимый тип секции' });
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      if (isEdit) {
        await api.patch(`/sections/${id}`, formData);
        setMessage({ type: 'success', text: 'Секция обновлена!' });
        setTimeout(() => navigate('/manage-a1b2c3/sections'), 500);
      } else {
        await api.post('/sections', formData);
        setMessage({ type: 'success', text: 'Секция создана!' });
        setTimeout(() => navigate('/manage-a1b2c3/sections'), 500);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Ошибка сохранения секции'
      });
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="section-form">
    <h2>{isEdit ? 'Редактировать секцию' : 'Создать новую секцию'}</h2>

    {message && (
      <div className={message.type === 'error' ? 'error' : 'success'}>
        {message.text}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Тип секции</label>
        <select name="type" value={formData.type} onChange={handleInputChange}>
          <option value="hero">Главный блок</option>
          <option value="content">Текстовый блок</option>
          <option value="news_block">Блок новостей</option>
          <option value="reviews_block">Отзывы</option>
          <option value="services_block">Услуги</option>
        </select>
      </div>

      <div className="form-row">
        <label>Заголовок</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Введите заголовок"
          required
        />
      </div>

      {formData.type !== 'news_block'  && formData.type !== 'reviews_block' && formData.type !== 'services_block' && (
        <>
          <div className="form-row">
            <label>Содержание</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Текст секции (для hero — подзаголовок)"
            />
          </div>

          <div className="form-row">
            <label>URL изображения</label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="Вставьте ссылку или загрузите файл"
            />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="upload-input" />
            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Предпросмотр" />
              </div>
            )}
          </div>
        </>
      )}

      <div className="form-row">
        <label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
          Активна (отображается на сайте)
        </label>
      </div>

      <div className="buttons-row">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Сохранение...' : isEdit ? 'Обновить секцию' : 'Создать секцию'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/manage-a1b2c3/sections')}
          className="cancel-btn"
        >
          Отмена
        </button>
      </div>
    </form>
  </div>
  );
};

export default SectionForm;