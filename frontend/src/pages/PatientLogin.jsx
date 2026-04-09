import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PatientLogin() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegistering && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    const endpoint = isRegistering ? '/api/auth/patient/register' : '/api/auth/patient/login';
    const payload = isRegistering 
      ? { name: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      if (isRegistering) {
        setSuccess('Registration successful! Please login.');
        setIsRegistering(false);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.role);
        navigate('/patient_index');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h2>{isRegistering ? 'Patient Registration' : 'Patient Login'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="form-control" required onChange={handleChange} value={formData.name} />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" className="form-control" required onChange={handleChange} value={formData.email} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-control" required onChange={handleChange} value={formData.password} />
          </div>
          {isRegistering && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" className="form-control" required onChange={handleChange} value={formData.confirmPassword} />
            </div>
          )}
          <button type="submit" className="btn-primary">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn-link" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientLogin;
