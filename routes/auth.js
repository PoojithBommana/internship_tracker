const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { signup, login, getMe } = require('../controllers/authController');

const router = express.Router();


router.post('/signup', validateSignup, signup);


router.post('/login', validateLogin, login);


router.get('/me', authenticateToken, getMe);

module.exports = router;
