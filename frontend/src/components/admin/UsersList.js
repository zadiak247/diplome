import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Данные формы
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
            setError('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!email || !password) {
            setMessage({ type: 'error', text: 'Заполните все поля' });
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/admin/users', { email, password });
            setMessage({ type: 'success', text: 'Пользователь создан' });
            setEmail('');
            setPassword('');
            fetchUsers(); // обновить список
        } catch (err) {
            const errMsg = err.response?.data?.error ||
                (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
                'Ошибка создания пользователя';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить пользователя?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Ошибка удаления: ' + (err.response?.data?.error || ''));
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <h2>Пользователи</h2>

            {/* Форма создания */}
            <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '30px', borderRadius: '5px' }}>
                <h3>Добавить администратора</h3>
                {message && (
                    <div className={message.type === 'error' ? 'error' : 'success'}>{message.text}</div>
                )}
                <form onSubmit={handleCreate}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Создание...' : 'Создать'}
                    </button>
                </form>
            </div>

            {/* Список пользователей */}
            <h3>Существующие пользователи</h3>
            {users.length === 0 ? (
                <p>Пользователей нет</p>
            ) : (
                <div className="section-list">
                    {users.map(user => (
                        <div key={user.id} className="section-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong>{user.email}</strong>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                    Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(user.id)} className="btn btn-danger">
                                Удалить
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersList;