import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [showPending, setShowPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('role');
    
    if (!loggedInUser || role !== 'admin') {
      navigate('/login_admin');
    } else {
      setUser(loggedInUser);
    }
  }, [navigate]);

  const fetchPendingDoctors = async () => {
    setShowPending(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/doctors/pending');
      if (res.ok) {
        const data = await res.json();
        setPendingDoctors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:8080/api/admin/doctors/${id}/${action}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchPendingDoctors(); // Refresh the list
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <span style={{ background: '#db2777', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem' }}>
          Role: Admin Central
        </span>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel">
          <h3>System Overview</h3>
          <p style={{ color: 'var(--text-muted)' }}>Manage all operations, patients, and doctors securely from this panel.</p>
        </div>

        <div className="glass-panel" style={{ gridColumn: showPending ? '1 / -1' : 'auto' }}>
          <h3>Pending Doctor Approvals</h3>
          {!showPending ? (
            <>
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                Manage pending doctor registrations.
              </p>
              <button className="btn-primary" style={{ background: '#db2777' }} onClick={fetchPendingDoctors}>
                View All Doctors
              </button>
            </>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <button className="btn-link" onClick={() => setShowPending(false)} style={{ marginBottom: '1rem' }}>
                &larr; Hide Doctors
              </button>
              {pendingDoctors.length === 0 ? (
                <p>No pending doctor requests.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Name</th>
                      <th style={{ padding: '0.75rem' }}>Specialization</th>
                      <th style={{ padding: '0.75rem' }}>Experience</th>
                      <th style={{ padding: '0.75rem' }}>Mode</th>
                      <th style={{ padding: '0.75rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDoctors.map(doc => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem' }}>{doc.name}</td>
                        <td style={{ padding: '0.75rem' }}>{doc.specialization}</td>
                        <td style={{ padding: '0.75rem' }}>{doc.experience} yrs</td>
                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{doc.mode}</td>
                        <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleAction(doc.id, 'approve')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
                            Approve
                          </button>
                          <button onClick={() => handleAction(doc.id, 'reject')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>
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
        </div>
        
        <div className="glass-panel">
          <h3>Patient Management</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Monitor patient activities and queries.</p>
          <button className="btn-primary" style={{ background: '#db2777' }}>View All Patients</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
