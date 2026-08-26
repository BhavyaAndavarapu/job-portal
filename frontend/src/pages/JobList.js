import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [message, setMessage] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const { user } = useAuth();

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs', { params: { search, location, job_type: jobType } });
      setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppliedJobs = async () => {
    if (user?.role !== 'candidate') return;

    try {
      const { data } = await api.get('/applications/me');
      setAppliedJobIds(data.map((app) => app.job_id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []); // eslint-disable-line

  const handleApply = async (jobId) => {
    setMessage('');
    try {
      await api.post('/applications', { job_id: jobId });
      setMessage('Application submitted successfully!');
      await fetchAppliedJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Open Positions</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input placeholder="Search title/description" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>
        <button onClick={fetchJobs}>Search</button>
      </div>

      {message && <p style={{ color: '#2563eb' }}>{message}</p>}

      {jobs.length === 0 && <p>No jobs found.</p>}
      {jobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <h3>{job.title}</h3>
          <p style={{ color: '#555' }}>{job.company_name} — {job.location || 'Remote'} — {job.job_type}</p>
          <p>{job.description.slice(0, 200)}...</p>
          {user?.role === 'candidate' && (
            appliedJobIds.includes(job.id) ? (
              <button type="button" style={{ ...btnStyle, background: '#6b7280', cursor: 'default' }} disabled>Applied</button>
            ) : (
              <button onClick={() => handleApply(job.id)} style={btnStyle}>Apply</button>
            )
          )}
        </div>
      ))}
    </div>
  );
}

const cardStyle = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' };
const btnStyle = { padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
