import React, { useState } from 'react';

function Auth({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    city: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Произошла ошибка');
      }

      onLogin(data);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Имя"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #e5e5e5',
                borderRadius: '4px'
              }}
            />
          )}
          {!isLogin && (
            <input
              type="text"
              name="city"
              placeholder="Город (например, Пермь)"
              value={formData.city}
              onChange={handleInputChange}
              style={{
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #e5e5e5',
                borderRadius: '4px'
              }}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          />
          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              style={{
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #e5e5e5',
                borderRadius: '4px'
              }}
            />
          )}
          <button
            type="submit"
            style={{
              padding: '0.75rem',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center',
          color: '#666'
        }}>
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4caf50',
              cursor: 'pointer',
              padding: 0,
              fontSize: 'inherit'
            }}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth; 