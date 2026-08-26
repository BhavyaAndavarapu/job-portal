const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET all companies (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching companies.' });
  }
});

// POST create company (recruiter only)
router.post('/', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { name, description, website } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required.' });

    const [result] = await pool.query(
      'INSERT INTO companies (recruiter_id, name, description, website) VALUES (?, ?, ?, ?)',
      [req.user.id, name, description || null, website || null]
    );
    res.status(201).json({ message: 'Company created.', companyId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating company.' });
  }
});

module.exports = router;
