import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? 'register' : 'login';
    try {
      const res = await axios.post(`http://127.0.0.1:8000/auth/${endpoint}`, formData);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              required 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn btn-primary full-width">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>
        <p className="toggle-text">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span onClick={() => setIsRegister(!isRegister)} className="text-link">
            {isRegister ? 'Sign in' : 'Create one'}
          </span>
        </p>
      </div>
    </div>
  );
}
