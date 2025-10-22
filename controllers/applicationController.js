const Application = require('../models/Application');
const User = require('../models/User');

// Get all applications for the authenticated user
const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'appliedDate', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching applications'
    });
  }
};

// Get a specific application
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching application'
    });
  }
};

// Create a new application
const createApplication = async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      user: req.user._id
    };

    // Convert date strings to Date objects if provided
    if (applicationData.applicationDate) {
      applicationData.applicationDate = new Date(applicationData.applicationDate);
    }
    if (applicationData.followUpDate) {
      applicationData.followUpDate = new Date(applicationData.followUpDate);
    }
    if (applicationData.offerDetails && applicationData.offerDetails.startDate) {
      applicationData.offerDetails.startDate = new Date(applicationData.offerDetails.startDate);
    }
    if (applicationData.interviewRounds && Array.isArray(applicationData.interviewRounds)) {
      applicationData.interviewRounds = applicationData.interviewRounds.map(round => ({
        ...round,
        date: new Date(round.date)
      }));
    }

    const application = new Application(applicationData);
    await application.save();
    await application.populate('user', 'name email');

    // Update user's hasApplicationCreated field to true
    await User.findByIdAndUpdate(req.user._id, { hasApplicationCreated: true });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating application'
    });
  }
};

// Update an application
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update fields
    const updateData = { ...req.body };
    
    // Convert date strings to Date objects if provided
    if (updateData.applicationDate) {
      updateData.applicationDate = new Date(updateData.applicationDate);
    }
    if (updateData.followUpDate) {
      updateData.followUpDate = new Date(updateData.followUpDate);
    }
    if (updateData.offerDetails && updateData.offerDetails.startDate) {
      updateData.offerDetails.startDate = new Date(updateData.offerDetails.startDate);
    }
    if (updateData.interviewRounds && Array.isArray(updateData.interviewRounds)) {
      updateData.interviewRounds = updateData.interviewRounds.map(round => ({
        ...round,
        date: new Date(round.date)
      }));
    }

    Object.assign(application, updateData);
    await application.save();
    await application.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating application'
    });
  }
};

// Delete an application
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting application'
    });
  }
};

// Clear all applications for the user
const clearAllApplications = async (req, res) => {
  try {
    const result = await Application.deleteMany({ user: req.user._id });
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} applications`
    });
  } catch (error) {
    console.error('Clear applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while clearing applications'
    });
  }
};

// Get applications for a specific user
const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.params.id })
      .sort({ applicationDate: -1 })
      .populate('user', 'name email');
    
    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user applications'
    });
  }
};

// Filter applications by status and month
const filterApplications = async (req, res) => {
  try {
    const { status, month, year, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.applicationDate = { $gte: startDate, $lte: endDate };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Application.find(query)
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    const total = await Application.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        filters: { status, month, year }
      }
    });
  } catch (error) {
    console.error('Filter applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while filtering applications'
    });
  }
};

// Sort applications
const sortApplications = async (req, res) => {
  try {
    const { by = 'applicationDate', order = 'desc', page = 1, limit = 10 } = req.query;
    
    // Build sort object
    const sort = {};
    sort[by] = order === 'asc' ? 1 : -1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Application.find({ user: req.user._id })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    const total = await Application.countDocuments({ user: req.user._id });
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        sort: { by, order }
      }
    });
  } catch (error) {
    console.error('Sort applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sorting applications'
    });
  }
};

// Search applications by company name
const searchApplications = async (req, res) => {
  try {
    const { company, position, location, page = 1, limit = 10 } = req.query;
    
    // Build search query
    const query = { user: req.user._id };
    
    if (company) {
      query.companyName = { $regex: company, $options: 'i' };
    }
    
    if (position) {
      query.position = { $regex: position, $options: 'i' };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Application.find(query)
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    const total = await Application.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        search: { company, position, location }
      }
    });
  } catch (error) {
    console.error('Search applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching applications'
    });
  }
};

// Get analytics trends
const getAnalyticsTrends = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '1month':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        break;
      case '3months':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1);
        break;
      default:
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
    }
    
    // Get applications by month
    const monthlyData = await Application.aggregate([
      {
        $match: {
          user: req.user._id,
          applicationDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' }
          },
          count: { $sum: 1 },
          statuses: { $push: '$status' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get status distribution
    const statusDistribution = await Application.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get application type distribution
    const typeDistribution = await Application.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$applicationType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        monthlyTrends: monthlyData,
        statusDistribution,
        typeDistribution,
        period
      }
    });
  } catch (error) {
    console.error('Get analytics trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching analytics trends'
    });
  }
};

// Get top companies
const getTopCompanies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topCompanies = await Application.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$companyName',
          count: { $sum: 1 },
          latestApplication: { $max: '$applicationDate' },
          statuses: { $push: '$status' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.json({
      success: true,
      data: {
        topCompanies,
        totalCompanies: topCompanies.length
      }
    });
  } catch (error) {
    console.error('Get top companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching top companies'
    });
  }
};

module.exports = {
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
};
