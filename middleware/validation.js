const validator = require('validator');

// Validation middleware for user registration
const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Name validation
  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for application creation/update
const validateApplication = (req, res, next) => {
  const { companyName, position, status, applicationDate, followUpDate, notes, location, applicationType, source } = req.body;
  const errors = [];

  // Required fields
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
    errors.push('Company name is required');
  } else if (companyName.trim().length > 100) {
    errors.push('Company name cannot exceed 100 characters');
  }

  if (!position || typeof position !== 'string' || position.trim().length === 0) {
    errors.push('Position is required');
  } else if (position.trim().length > 100) {
    errors.push('Position cannot exceed 100 characters');
  }

  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    errors.push('Location is required');
  } else if (location.trim().length > 100) {
    errors.push('Location cannot exceed 100 characters');
  }

  if (!applicationType || typeof applicationType !== 'string' || applicationType.trim().length === 0) {
    errors.push('Application type is required');
  } else if (!['Summer', 'Winter', 'Fall', 'Spring', 'Full-time', 'Part-time'].includes(applicationType)) {
    errors.push('Application type must be one of: Summer, Winter, Fall, Spring, Full-time, Part-time');
  }

  if (!source || typeof source !== 'string' || source.trim().length === 0) {
    errors.push('Source is required');
  } else if (source.trim().length > 100) {
    errors.push('Source cannot exceed 100 characters');
  }

  // Optional fields validation
  if (status && !['Applied', 'Under Review', 'Interview', 'Accepted', 'Rejected', 'Withdrawn'].includes(status)) {
    errors.push('Status must be one of: Applied, Under Review, Interview, Accepted, Rejected, Withdrawn');
  }

  if (applicationDate && !validator.isISO8601(applicationDate)) {
    errors.push('Application date must be a valid ISO 8601 date');
  }

  if (followUpDate && !validator.isISO8601(followUpDate)) {
    errors.push('Follow-up date must be a valid ISO 8601 date');
  }

  if (notes && typeof notes === 'string' && notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateApplication
};
