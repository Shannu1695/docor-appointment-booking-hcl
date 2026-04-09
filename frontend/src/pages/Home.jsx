import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Welcome to MedCare Appointment System</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.2rem' }}>
        Seamlessly managing healthcare connections between Patients, Doctors, and Administration.
      </p>

      <div className="dashboard-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="glass-panel">
          <h3>For Patients</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Book appointments with top specialists from the comfort of your home.</p>
          <Link to="/login_patient">
            <button className="btn-primary">Patient Portal</button>
          </Link>
        </div>
        
        <div className="glass-panel">
          <h3>For Doctors</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Manage your practice, view appointments, and connect with your patients.</p>
          <Link to="/login_doctor">
            <button className="btn-primary" style={{ background: '#059669' }}>Doctor Portal</button>
          </Link>
        </div>

        <div className="glass-panel">
          <h3>Administration</h3>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Oversee operations, approve new doctors, and maintain system integrity.</p>
          <Link to="/login_admin">
            <button className="btn-primary" style={{ background: '#db2777' }}>Admin Panel</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
