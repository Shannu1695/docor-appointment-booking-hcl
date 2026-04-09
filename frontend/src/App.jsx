import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import PatientLogin from './pages/PatientLogin';
import DoctorLogin from './pages/DoctorLogin';
import AdminLogin from './pages/AdminLogin';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const role = localStorage.getItem('role');

  return (
    <>
      <nav className="navbar">
        <div>
          <Link to="/" style={{ fontSize: '1.25rem', margin: 0 }}>MedCare App</Link>
        </div>
        <div>
          {!user ? (
            <>
              <Link to="/login_patient">Patient Login</Link>
              <Link to="/login_doctor">Doctor Login</Link>
              <Link to="/login_admin">Admin Login</Link>
            </>
          ) : (
            <>
              <span style={{ marginRight: '1.5rem', color: 'var(--text-muted)' }}>Welcome, {user.name || user.username}</span>
              {role === 'patient' && <Link to="/patient_index">Dashboard</Link>}
              {role === 'doctor' && <Link to="/doctor_index">Dashboard</Link>}
              {role === 'admin' && <Link to="/admin_index">Dashboard</Link>}
              <button className="btn-link" onClick={logout} style={{ marginLeft: '1rem', color: 'white', marginTop: 0 }}>Logout</button>
            </>
          )}
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login_patient" element={<PatientLogin />} />
          <Route path="/login_doctor" element={<DoctorLogin />} />
          <Route path="/login_admin" element={<AdminLogin />} />
          
          <Route path="/patient_index" element={<PatientDashboard />} />
          <Route path="/doctor_index" element={<DoctorDashboard />} />
          <Route path="/admin_index" element={<AdminDashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
