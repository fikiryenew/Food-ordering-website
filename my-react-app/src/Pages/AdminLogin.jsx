// src/Pages/Admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoggingIn(true);

    // Mock authentication check (Replace with Firebase Auth in Phase 5)
    setTimeout(() => {
      if (email === 'admin@restaurant.com' && password === 'admin123') {
        localStorage.setItem('admin_token', 'mock_authenticated_admin_session');
        setIsLoggingIn(false);
        navigate('/admin/dashboard');
      } else {
        setIsLoggingIn(false);
        setErrorMsg('Invalid admin credentials. Please try again.');
      }
    }, 800);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <header className="login-header">
          <h2>Admin Portal Sign In</h2>
          <p>Restricted access for authorized staff only.</p>
        </header>

        {errorMsg && <div className="login-error-banner">{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Admin Email</label>
            <input 
              type="email" 
              placeholder="admin@restaurant.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing In...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;