const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateApplication } = require('../middleware/validation');
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  clearAllApplications,
  getUserApplications,
  filterApplications,
  sortApplications,
  searchApplications,
  getAnalyticsTrends,
  getTopCompanies
} = require('../controllers/applicationController');

const router = express.Router();


// Get all applications for authenticated user
router.get('/', authenticateToken, getAllApplications);

// Filter applications by status and month
router.get('/filter', authenticateToken, filterApplications);

// Sort applications
router.get('/sort', authenticateToken, sortApplications);

// Search applications
router.get('/search', authenticateToken, searchApplications);

// Get applications for a specific user
router.get('/user/:id', authenticateToken, getUserApplications);

// Get specific application by ID (must be last to avoid conflicts)
router.get('/:id', authenticateToken, getApplicationById);

// Create new application
router.post('/', authenticateToken, validateApplication, createApplication);

// Update application
router.put('/:id', authenticateToken, validateApplication, updateApplication);

// Delete specific application
router.delete('/:id', authenticateToken, deleteApplication);

// Clear all applications for user
router.delete('/', authenticateToken, clearAllApplications);

module.exports = router;
