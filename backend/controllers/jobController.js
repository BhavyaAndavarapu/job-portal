const pool = require('../config/db');

// GET /api/jobs - public, with search & filter
exports.getJobs = async (req, res) => {
  try {
    const { search, location, job_type, status = 'open', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT j.*, c.name AS company_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.status = ?
    `;
    const params = [status];

    if (search) {
      query += ' AND (j.title LIKE ? OR j.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (location) {
      query += ' AND j.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (job_type) {
      query += ' AND j.job_type = ?';
      params.push(job_type);
    }

    query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [jobs] = await pool.query(query, params);
    res.json({ jobs, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching jobs.' });
  }
};

// GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, c.name AS company_name FROM jobs j
       JOIN companies c ON j.company_id = c.id WHERE j.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Job not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching job.' });
  }
};

// POST /api/jobs - recruiter only
exports.createJob = async (req, res) => {
  try {
    const { company_id, title, description, location, job_type, salary_min, salary_max } = req.body;
    if (!company_id || !title || !description) {
      return res.status(400).json({ message: 'company_id, title and description are required.' });
    }

    let companyId = company_id;
    const companyInput = company_id?.toString().trim();

    if (!companyInput) {
      return res.status(400).json({ message: 'company_id, title and description are required.' });
    }

    if (Number.isNaN(Number(companyInput))) {
      // Treat the value as a company name and use existing company or create a new one for this recruiter.
      const [existingCompanies] = await pool.query(
        'SELECT id FROM companies WHERE name = ? AND recruiter_id = ?',
        [companyInput, req.user.id]
      );
      if (existingCompanies.length > 0) {
        companyId = existingCompanies[0].id;
      } else {
        const [companyResult] = await pool.query(
          'INSERT INTO companies (recruiter_id, name, description, website) VALUES (?, ?, ?, ?)',
          [req.user.id, companyInput, null, null]
        );
        companyId = companyResult.insertId;
      }
    } else {
      companyId = Number(companyInput);
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (company_id, posted_by, title, description, location, job_type, salary_min, salary_max)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, req.user.id, title, description, location, job_type || 'full-time', salary_min, salary_max]
    );

    res.status(201).json({ message: 'Job created successfully.', jobId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating job.' });
  }
};

// GET /api/jobs/my - recruiter only, only jobs posted by current recruiter
exports.getMyJobs = async (req, res) => {
  try {
    const { status = 'open', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [jobs] = await pool.query(
      `SELECT j.*, c.name AS company_name
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.posted_by = ? AND j.status = ?
       ORDER BY j.created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, status, Number(limit), Number(offset)]
    );

    res.json({ jobs, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching recruiter jobs.' });
  }
};

// PUT /api/jobs/:id - recruiter only, must own job
exports.updateJob = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Job not found.' });
    if (rows[0].posted_by !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this job posting.' });
    }

    const fields = ['title', 'description', 'location', 'job_type', 'salary_min', 'salary_max', 'status'];
    const updates = [];
    const params = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update.' });

    params.push(req.params.id);
    await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Job updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating job.' });
  }
};

// DELETE /api/jobs/:id - recruiter only, must own job
exports.deleteJob = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Job not found.' });
    if (rows[0].posted_by !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this job posting.' });
    }

    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting job.' });
  }
};
