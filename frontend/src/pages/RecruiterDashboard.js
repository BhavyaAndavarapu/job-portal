import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function RecruiterDashboard() {
  const [jobForm, setJobForm] = useState({ company_id: '', title: '', description: '', location: '', job_type: 'full-time' });
  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchJobs = async () => {
    const { data } = await api.get('/jobs/my', { params: { status: 'open' } });
    setMyJobs(data.jobs);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobChange = (e) => setJobForm({ ...jobForm, [e.target.name]: e.target.value });

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/jobs', jobForm);
      setMessage('Job posted successfully.');
      setJobForm({ company_id: '', title: '', description: '', location: '', job_type: 'full-time' });
      fetchJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post job.');
    }
  };

  const viewApplicants = async (jobId) => {
    setSelectedJobId(jobId);
    const { data } = await api.get(`/applications/job/${jobId}`);
    setApplicants(data);
  };

  const updateStatus = async (appId, status) => {
    await api.patch(`/applications/${appId}/status`, { status });
    viewApplicants(selectedJobId);
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Recruiter Dashboard</h2>

      <h3>Post a New Job</h3>
      {message && <p style={{ color: '#2563eb' }}>{message}</p>}
      <form onSubmit={handleCreateJob} style={{ marginBottom: '2rem' }}>
        <input name="company_id" type="text" placeholder="Enter Company" value={jobForm.company_id} onChange={handleJobChange} required style={inputStyle} />
        <input name="title" placeholder="Job Title" value={jobForm.title} onChange={handleJobChange} required style={inputStyle} />
        <textarea name="description" placeholder="Job Description" value={jobForm.description} onChange={handleJobChange} required style={{ ...inputStyle, height: 80 }} />
        <input name="location" placeholder="Location" value={jobForm.location} onChange={handleJobChange} style={inputStyle} />
        <select name="job_type" value={jobForm.job_type} onChange={handleJobChange} style={inputStyle}>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>
        <button type="submit" style={btnStyle}>Post Job</button>
      </form>

      <h3>My Job Postings</h3>
      {myJobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <strong>{job.title}</strong> — {job.location}
          <button onClick={() => viewApplicants(job.id)} style={{ ...btnStyle, marginLeft: '1rem' }}>View Applicants</button>
        </div>
      ))}

      {selectedJobId && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Applicants</h3>
          {applicants.length === 0 && <p>No applicants yet.</p>}
          {applicants.map((a) => (
            <div key={a.id} style={cardStyle}>
              <p><strong>{a.candidate_name}</strong> ({a.candidate_email})</p>
              <p>Skills: {a.skills || 'N/A'} | Experience: {a.experience_years || 0} yrs</p>
              <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = { display: 'block', width: '100%', padding: '0.6rem', marginBottom: '0.8rem' };
const btnStyle = { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const cardStyle = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' };
