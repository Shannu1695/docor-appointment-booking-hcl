import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DoctorLogin() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', email: '', specialization: '', experience: '', mode: 'offline', 
    username: '', password: '', confirmPassword: '' 
  });
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

    const endpoint = isRegistering ? '/api/auth/doctor/register' : '/api/auth/doctor/login';
    const payload = isRegistering 
      ? { ...formData }
      : { username: formData.username, password: formData.password };
    delete payload.confirmPassword;

    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      if (isRegistering) {
        setSuccess(data.message); // Will show "Sent for approval or approval in process"
        setFormData({ ...formData, password: '', confirmPassword: '' });
        // Don't switch to login immediately so they can read the approval message
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.role);
        navigate('/doctor_index');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ margin: '2rem 0' }}>
      <div className={`glass-panel auth-card ${isRegistering ? 'large' : ''}`}>
        <h2>{isRegistering ? 'Doctor Registration' : 'Doctor Login'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" className="form-control" required onChange={handleChange} value={formData.name} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" className="form-control" required onChange={handleChange} value={formData.email} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <input type="text" name="specialization" className="form-control" required onChange={handleChange} value={formData.specialization} />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" name="experience" className="form-control" required onChange={handleChange} value={formData.experience} />
                </div>
              </div>
              <div className="form-group">
                <label>Mode of Consultation</label>
                <select name="mode" className="form-control" onChange={handleChange} value={formData.mode}>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" className="form-control" required onChange={handleChange} value={formData.username} />
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

          <button type="submit" className="btn-primary" style={{ background: '#059669' }}>
            {isRegistering ? 'Register & Submit for Approval' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn-link" onClick={() => {setIsRegistering(!isRegistering); setSuccess('');}}>
            {isRegistering ? 'Already registered? Login' : "Want to join? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
