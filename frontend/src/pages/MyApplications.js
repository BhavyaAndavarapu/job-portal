import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const statusColors = {
  applied: '#64748b',
  under_review: '#f59e0b',
  shortlisted: '#3b82f6',
  rejected: '#ef4444',
  hired: '#16a34a'
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);

  const fetchApplications = async () => {
    const { data } = await api.get('/applications/me');
    setApplications(data);
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdraw = async (id) => {
    await api.delete(`/applications/${id}`);
    fetchApplications();
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>My Applications</h2>
      {applications.length === 0 && <p>You haven't applied to any jobs yet.</p>}
      {applications.map((app) => (
        <div key={app.id} style={cardStyle}>
          <h3>{app.job_title}</h3>
          <p>{app.company_name}</p>
          <span style={{ ...badgeStyle, background: statusColors[app.status] }}>{app.status.replace('_', ' ')}</span>
          <div style={{ marginTop: '0.5rem' }}>
            <button onClick={() => handleWithdraw(app.id)} style={withdrawBtn}>Withdraw</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' };
const badgeStyle = { color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', textTransform: 'capitalize' };
const withdrawBtn = { padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
