const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  applyToJob, getMyApplications, getApplicationsForJob,
  updateApplicationStatus, withdrawApplication
} = require('../controllers/applicationController');

router.post('/', authenticate, authorize('candidate'), applyToJob);
router.get('/me', authenticate, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', authenticate, authorize('recruiter'), getApplicationsForJob);
router.patch('/:id/status', authenticate, authorize('recruiter'), updateApplicationStatus);
router.delete('/:id', authenticate, authorize('candidate'), withdrawApplication);

module.exports = router;
