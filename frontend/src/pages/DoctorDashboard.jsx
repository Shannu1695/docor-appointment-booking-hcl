import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  
  // Update Profile State
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('role');
    
    if (!loggedInUser || role !== 'doctor') {
      navigate('/login_doctor');
    } else {
      setUser(loggedInUser);
      setProfileData({
        name: loggedInUser.name,
        email: loggedInUser.email,
        specialization: loggedInUser.specialization,
        experience: loggedInUser.experience,
        mode: loggedInUser.mode
      });
      if (loggedInUser.status === 'APPROVED') {
        fetchAppointments(loggedInUser.id);
      }
    }
  }, [navigate]);

  const fetchAppointments = async (doctorId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/appointments/doctor/${doctorId}`);
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, status) => {
    let payload = { status };
    if (status === 'REJECTED') {
      const reason = window.prompt("Reason for rejection:");
      if (reason === null) return; // User cancelled prompt
      payload.reason = reason;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/appointments/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchAppointments(user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/doctors/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        alert("Profile updated successfully");
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsUpdating(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
  const pastAppointments = appointments.filter(a => a.status !== 'PENDING');

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="dashboard-header">
        <h2>Doctor Dashboard</h2>
        <span style={{ 
          background: user.status === 'APPROVED' ? '#10b981' : '#f59e0b', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '12px', 
          fontSize: '0.875rem',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          Status: {user.status}
        </span>
      </div>

      {user.status === 'PENDING' && (
        <div className="alert alert-error" style={{ marginBottom: '2rem', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}>
          <strong>Notice:</strong> Your profile is currently pending approval by the administration. You will be able to accept appointments once approved.
        </div>
      )}

      <div className="dashboard-grid">
        <div className="glass-panel" style={{ gridColumn: isUpdating ? '1 / -1' : 'auto' }}>
          {!isUpdating ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Dr. {user.name}</h3>
                <button className="btn-link" onClick={() => setIsUpdating(true)}>Update Profile</button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email: {user.email}</p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Specialization: {user.specialization}</p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Experience: {user.experience} Years</p>
              <p style={{ color: 'var(--text-muted)' }}>Mode: {user.mode?.toUpperCase()}</p>
            </>
          ) : (
            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Update Profile</h3>
                <button type="button" className="btn-link" onClick={() => setIsUpdating(false)}>Cancel</button>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input className="form-control" value={profileData.specialization} onChange={e => setProfileData({...profileData, specialization: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Experience (Years)</label>
                  <input type="number" className="form-control" value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value})} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Mode</label>
                  <select className="form-control" value={profileData.mode} onChange={e => setProfileData({...profileData, mode: e.target.value})}>
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>Save Changes</button>
            </form>
          )}
        </div>
        
        {user.status === 'APPROVED' && !isUpdating && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h3>Appointment Requests</h3>
            {pendingAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No pending requests right now.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Patient Name</th>
                    <th style={{ padding: '0.75rem' }}>Date & Time</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAppointments.map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>{appt.patient.name}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {new Date(appt.startTime).toLocaleString()} - {new Date(appt.endTime).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleAction(appt.id, 'ACCEPTED')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                          Accept
                        </button>
                        <button onClick={() => handleAction(appt.id, 'REJECTED')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {user.status === 'APPROVED' && !isUpdating && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h3>Appointment History</h3>
            {pastAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No history available.</p>
            ) : (
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Patient Name</th>
                      <th style={{ padding: '0.75rem' }}>Date & Time</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAppointments.map(appt => (
                      <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem' }}>{appt.patient.name}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {new Date(appt.startTime).toLocaleString()} - {new Date(appt.endTime).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem',
                            background: appt.status === 'ACCEPTED' ? '#10b981' : appt.status === 'CANCELLED' ? '#6b7280' : '#ef4444' 
                          }}>
                            {appt.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {appt.rejectReason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
