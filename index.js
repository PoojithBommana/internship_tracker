const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const filterRoutes = require('./routes/filter');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nanipoojith03_db_user:poojith032813@cluster0.b4yxlpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(() => {
  console.log(' Connected to MongoDB');
}).catch((err) => {
  console.error(' MongoDB connection error:', err);
  console.log(' To fix this:');
  console.log('1. Go to MongoDB Atlas dashboard');
  console.log('2. Click "Network Access" in the left sidebar');
  console.log('3. Click "Add IP Address"');
  console.log('4. Click "Add Current IP Address" or add 0.0.0.0/0 for all IPs');
  console.log('5. Or use a local MongoDB: mongodb://localhost:27017/internship-tracker');
  process.exit(1);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/applications', filterRoutes);
app.use('/api/analytics', analyticsRoutes);

// User-specific applications endpoint
app.get('/api/applications/user/:id', require('./middleware/auth').authenticateToken, require('./controllers/applicationController').getUserApplications);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});