import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`http://localhost:8080/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.role);
      navigate('/admin_index');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h2>Admin Authentication</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" className="form-control" required onChange={handleChange} value={formData.username} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-control" required onChange={handleChange} value={formData.password} />
          </div>
          <button type="submit" className="btn-primary" style={{ background: '#db2777' }}>
            Login to Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
