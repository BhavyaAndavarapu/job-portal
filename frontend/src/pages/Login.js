import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={btnStyle}>Login</button>
      </form>
      <p>No account? <Link to="/register">Register here</Link></p>
    </div>
  );
}

const inputStyle = { display: 'block', width: '100%', padding: '0.6rem', marginBottom: '1rem' };
const btnStyle = { width: '100%', padding: '0.6rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
