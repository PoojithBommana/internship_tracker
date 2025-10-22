const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { filterApplications, sortApplications, searchApplications } = require('../controllers/filterController');

const router = express.Router();

// GET /api/applications/filter - Filter applications by status and month
router.get('/filter', authenticateToken, filterApplications);

// GET /api/applications/sort - Sort applications
router.get('/sort', authenticateToken, sortApplications);

// GET /api/applications/search - Search applications
router.get('/search', authenticateToken, searchApplications);

module.exports = router;
