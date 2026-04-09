import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [doctors, setDoctors] = useState([]);
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [appointments, setAppointments] = useState([]);
  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('role');
    
    if (!loggedInUser || role !== 'patient') {
      navigate('/login_patient');
    } else {
      setUser(loggedInUser);
      fetchAppointments(loggedInUser.id);
    }
  }, [navigate]);

  useEffect(() => {
    if (isBooking) {
      fetch('http://localhost:8080/api/appointments/specializations')
        .then(res => res.json())
        .then(data => setSpecializations(data))
        .catch(console.error);
    }
  }, [isBooking]);

  useEffect(() => {
    if (selectedSpec) {
      const url = new URL('http://localhost:8080/api/appointments/doctors');
      url.searchParams.append('specialization', selectedSpec);
      if (selectedMode) {
        url.searchParams.append('mode', selectedMode);
      }
      fetch(url)
        .then(res => res.json())
        .then(data => setDoctors(data))
        .catch(console.error);
    } else {
      setDoctors([]);
    }
  }, [selectedSpec, selectedMode]);

  const fetchAppointments = async (patientId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/appointments/patient/${patientId}`);
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitBooking = async () => {
    if (!startTime || !endTime) {
      alert("Please select start and end time");
      return;
    }
    const payload = {
      doctorId: selectedDoctor.id,
      patientId: user.id,
      startTime,
      endTime
    };
    try {
      const res = await fetch('http://localhost:8080/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Appointment booked successfully!");
        setIsBooking(false);
        setSelectedDoctor(null);
        setSelectedSpec('');
        setSelectedMode('');
        setStartTime('');
        setEndTime('');
        fetchAppointments(user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/appointments/${id}/cancel`, {
        method: 'POST'
      });
      if (res.ok) fetchAppointments(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReschedule = async (id) => {
    if (!newStartTime || !newEndTime) {
      alert("Please select new start and end times.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: newStartTime, endTime: newEndTime })
      });
      if (res.ok) {
        alert("Appointment rescheduled and sent to doctor for approval.");
        setReschedulingId(null);
        setNewStartTime('');
        setNewEndTime('');
        fetchAppointments(user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <span style={{ background: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem' }}>
          Patient ID: {user.id}
        </span>
      </div>

      <div className="dashboard-grid">
        {!isBooking ? (
          <div className="glass-panel">
            <h3>Welcome, {user.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>Email: {user.email}</p>
            <hr style={{ borderColor: 'var(--glass-border)', margin: '1rem 0' }} />
            <p>You can book appointments and view your medical history here.</p>
            <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setIsBooking(true)}>
              Book New Appointment
            </button>
          </div>
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Book Appointment</h3>
              <button className="btn-link" onClick={() => { setIsBooking(false); setSelectedDoctor(null); }}>Cancel Booking</button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label>Specialization</label>
                <select className="form-control" value={selectedSpec} onChange={e => { setSelectedSpec(e.target.value); setSelectedDoctor(null); }}>
                  <option value="">-- Select Specialization --</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Mode</label>
                <select className="form-control" value={selectedMode} onChange={e => { setSelectedMode(e.target.value); setSelectedDoctor(null); }}>
                  <option value="">Any</option>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {selectedSpec && doctors.length > 0 && !selectedDoctor && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Doctor Name</th>
                    <th style={{ padding: '0.75rem' }}>Experience</th>
                    <th style={{ padding: '0.75rem' }}>Mode</th>
                    <th style={{ padding: '0.75rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}>Dr. {doc.name}</td>
                      <td style={{ padding: '0.75rem' }}>{doc.experience} yrs</td>
                      <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{doc.mode}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button className="btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setSelectedDoctor(doc)}>Select</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {selectedSpec && doctors.length === 0 && <p>No doctors found for these criteria.</p>}

            {selectedDoctor && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4>Selected Doctor: Dr. {selectedDoctor.name} ({selectedDoctor.specialization})</h4>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Start Time</label>
                    <input type="datetime-local" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>End Time</label>
                    <input type="datetime-local" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" style={{ background: '#10b981' }} onClick={submitBooking}>Confirm Appointment</button>
                  <button className="btn-link" onClick={() => setSelectedDoctor(null)}>Change Doctor</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="glass-panel" style={{ gridColumn: isBooking ? '1 / -1' : 'auto' }}>
          <h3>Appointments History</h3>
          {appointments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No appointments scheduled.</p>
          ) : (
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Doctor</th>
                    <th style={{ padding: '0.75rem' }}>Date & Time</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Info/Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => {
                    const apptTime = new Date(appt.startTime).getTime();
                    const now = new Date().getTime();
                    const showActions = appt.status === 'ACCEPTED' && (apptTime - now) > 30 * 60 * 1000;

                    return (
                      <React.Fragment key={appt.id}>
                        <tr style={{ borderBottom: reschedulingId !== appt.id ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                          <td style={{ padding: '0.75rem' }}>Dr. {appt.doctor.name}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {new Date(appt.startTime).toLocaleString()} - {new Date(appt.endTime).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem',
                              background: appt.status === 'ACCEPTED' ? '#10b981' : appt.status === 'CANCELLED' ? '#6b7280' : appt.status === 'REJECTED' ? '#ef4444' : '#f59e0b' 
                            }}>
                              {appt.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                            {appt.status === 'REJECTED' && <div style={{ color: '#ef4444' }}>Reason: {appt.rejectReason}</div>}
                            {showActions && reschedulingId !== appt.id && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-link" style={{ fontSize: '0.8rem', padding: 0 }} onClick={() => setReschedulingId(appt.id)}>Reschedule</button>
                                <button className="btn-link" style={{ fontSize: '0.8rem', padding: 0, color: '#ef4444' }} onClick={() => handleCancel(appt.id)}>Cancel</button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {reschedulingId === appt.id && (
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td colSpan={4} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.8rem' }}>New Start Time</label>
                                  <input type="datetime-local" className="form-control" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.8rem' }}>New End Time</label>
                                  <input type="datetime-local" className="form-control" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} />
                                </div>
                                <div>
                                  <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => submitReschedule(appt.id)}>Confirm</button>
                                  <button className="btn-link" style={{ marginLeft: '1rem' }} onClick={() => setReschedulingId(null)}>Cancel</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
