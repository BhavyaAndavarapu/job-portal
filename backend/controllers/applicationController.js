const pool = require('../config/db');

// POST /api/applications - candidate applies to a job
exports.applyToJob = async (req, res) => {
  try {
    const { job_id, cover_letter } = req.body;
    if (!job_id) return res.status(400).json({ message: 'job_id is required.' });

    const [job] = await pool.query('SELECT id, status FROM jobs WHERE id = ?', [job_id]);
    if (job.length === 0) return res.status(404).json({ message: 'Job not found.' });
    if (job[0].status !== 'open') return res.status(400).json({ message: 'This job is no longer accepting applications.' });

    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?',
      [job_id, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'You already applied to this job.' });
    }

    const [result] = await pool.query(
      'INSERT INTO applications (job_id, candidate_id, cover_letter) VALUES (?, ?, ?)',
      [job_id, req.user.id, cover_letter || null]
    );

    res.status(201).json({ message: 'Application submitted.', applicationId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting application.' });
  }
};

// GET /api/applications/me - candidate views their applications
exports.getMyApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, j.title AS job_title, c.name AS company_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.candidate_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching applications.' });
  }
};

// GET /api/applications/job/:jobId - recruiter views applicants for a job
exports.getApplicationsForJob = async (req, res) => {
  try {
    const [job] = await pool.query('SELECT posted_by FROM jobs WHERE id = ?', [req.params.jobId]);
    if (job.length === 0) return res.status(404).json({ message: 'Job not found.' });
    if (job[0].posted_by !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this job posting.' });
    }

    const [rows] = await pool.query(
      `SELECT a.*, u.name AS candidate_name, u.email AS candidate_email,
              cp.resume_url, cp.skills, cp.experience_years
       FROM applications a
       JOIN users u ON a.candidate_id = u.id
       LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
       WHERE a.job_id = ?
       ORDER BY a.applied_at DESC`,
      [req.params.jobId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching applicants.' });
  }
};

// PATCH /api/applications/:id/status - recruiter updates application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'under_review', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const [rows] = await pool.query(
      `SELECT a.id, j.posted_by FROM applications a
       JOIN jobs j ON a.job_id = j.id WHERE a.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Application not found.' });
    if (rows[0].posted_by !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this job posting.' });
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Application status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating application status.' });
  }
};

// DELETE /api/applications/:id - candidate withdraws application
exports.withdrawApplication = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Application not found.' });
    if (rows[0].candidate_id !== req.user.id) {
      return res.status(403).json({ message: 'You cannot withdraw this application.' });
    }

    await pool.query('DELETE FROM applications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Application withdrawn.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error withdrawing application.' });
  }
};
