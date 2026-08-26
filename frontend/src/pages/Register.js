import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required style={inputStyle} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} />
        <select name="role" value={form.role} onChange={handleChange} style={inputStyle}>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button type="submit" style={btnStyle}>Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

const inputStyle = { display: 'block', width: '100%', padding: '0.6rem', marginBottom: '1rem' };
const btnStyle = { width: '100%', padding: '0.6rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
