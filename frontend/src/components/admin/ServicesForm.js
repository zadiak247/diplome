import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ServicesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/services/${id}`)
        .then(res => setFormData(res.data))
        .catch(console.error);
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
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Введите название услуги' });
      return;
    }
    setLoading(true);
    const dataToSend = {
      ...formData,
      price: formData.price === '' ? null : parseFloat(formData.price)
    };
    try {
      if (isEdit) {
        await api.patch(`/services/${id}`, dataToSend);
        setMessage({ type: 'success', text: 'Услуга обновлена' });
        setTimeout(() => navigate('/manage-a1b2c3/services'), 500);
      } else {
        await api.post('/services', dataToSend);
        setMessage({ type: 'success', text: 'Услуга создана' });
        setTimeout(() => navigate('/manage-a1b2c3/services'), 500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-form">
      <h2>{isEdit ? 'Редактировать услугу' : 'Новая услуга'}</h2>
      {message && <div className={message.type === 'error' ? 'error' : 'success'}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Описание</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Цена</label>
          <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label>Изображение URL</label>
          <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} />
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: '10px' }} />
          {formData.image_url && <img src={formData.image_url} alt="preview" style={{ maxWidth: '200px', marginTop: '10px' }} />}
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
            Активно
          </label>
        </div>
        <div className="buttons-row">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
          </button>
          <button type="button" onClick={() => navigate('/manage-a1b2c3/services')} className="btn btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicesForm;