const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getJobs, getJobById, getMyJobs, createJob, updateJob, deleteJob
} = require('../controllers/jobController');

router.get('/my', authenticate, authorize('recruiter'), getMyJobs);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authenticate, authorize('recruiter'), createJob);
router.put('/:id', authenticate, authorize('recruiter'), updateJob);
router.delete('/:id', authenticate, authorize('recruiter'), deleteJob);

module.exports = router;
