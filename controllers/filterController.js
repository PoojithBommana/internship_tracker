const Application = require('../models/Application');

// Filter applications by status and month
const filterApplications = async (req, res) => {
  try {
    const { status, month, year, jobType, location } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (month) {
      const monthNum = parseInt(month);
      if (year) {
        // Filter by specific month and year
        const yearNum = parseInt(year);
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
        query.applicationDate = { $gte: startDate, $lte: endDate };
      } else {
        // Filter by month in current year
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, monthNum - 1, 1);
        const endDate = new Date(currentYear, monthNum, 0, 23, 59, 59);
        query.applicationDate = { $gte: startDate, $lte: endDate };
      }
    } else if (year) {
      // Filter by year only
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum, 11, 31, 23, 59, 59);
      query.applicationDate = { $gte: startDate, $lte: endDate };
    }

    if (jobType) {
      query.jobType = jobType;
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
        filters: {
          status,
          month,
          year,
          jobType,
          location
        }
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
    const { by = 'applicationDate', order = 'desc' } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Validate sort fields
    const allowedSortFields = ['applicationDate', 'company', 'position', 'status', 'createdAt', 'updatedAt'];
    const sortBy = allowedSortFields.includes(by) ? by : 'applicationDate';
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

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
        sort: {
          by: sortBy,
          order: order
        }
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

// Search applications
const searchApplications = async (req, res) => {
  try {
    const { company, position, keyword } = req.query;
    const { page = 1, limit = 10 } = req.query;

    // Build search query
    const query = { user: req.user._id };
    const searchConditions = [];

    if (company) {
      searchConditions.push({ company: { $regex: company, $options: 'i' } });
    }

    if (position) {
      searchConditions.push({ position: { $regex: position, $options: 'i' } });
    }

    if (keyword) {
      searchConditions.push({
        $or: [
          { company: { $regex: keyword, $options: 'i' } },
          { position: { $regex: keyword, $options: 'i' } },
          { notes: { $regex: keyword, $options: 'i' } },
          { location: { $regex: keyword, $options: 'i' } }
        ]
      });
    }

    if (searchConditions.length > 0) {
      query.$and = searchConditions;
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
        search: {
          company,
          position,
          keyword
        }
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

module.exports = {
  filterApplications,
  sortApplications,
  searchApplications
};
