const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAnalyticsTrends,
  getTopCompanies
} = require('../controllers/applicationController');

const router = express.Router();

// Get analytics trends
router.get('/trends', authenticateToken, getAnalyticsTrends);

// Get top companies
router.get('/top-companies', authenticateToken, getTopCompanies);

module.exports = router;