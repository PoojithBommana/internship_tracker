const Application = require('../models/Application');

// Get application trends over time
const getTrends = async (req, res) => {
  try {
    const { period = 'month', year } = req.query;
    const userId = req.user._id;

    let startDate, endDate;

    // Set date range based on period
    const now = new Date();
    if (year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    } else {
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          endDate = now;
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          endDate = now;
      }
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          user: userId,
          appliedDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' },
            day: period === 'week' ? { $dayOfMonth: '$appliedDate' } : null
          },
          count: { $sum: 1 },
          statuses: {
            $push: '$status'
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ];

    const trends = await Application.aggregate(pipeline);

    // Format the data for charts
    const formattedTrends = trends.map(trend => {
      const date = new Date(trend._id.year, trend._id.month - 1, trend._id.day || 1);
      return {
        date: date.toISOString().split('T')[0],
        count: trend.count,
        statuses: trend.statuses
      };
    });

    // Get status breakdown
    const statusBreakdown = await Application.aggregate([
      {
        $match: {
          user: userId,
          appliedDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        trends: formattedTrends,
        statusBreakdown,
        period,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching trends'
    });
  }
};

// Get top companies by application count
const getTopCompanies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;

    const topCompanies = await Application.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: '$company',
          count: { $sum: 1 },
          statuses: {
            $push: '$status'
          },
          positions: {
            $push: '$position'
          }
        }
      },
      {
        $project: {
          company: '$_id',
          count: 1,
          statuses: 1,
          positions: 1,
          successRate: {
            $divide: [
              { $size: { $filter: { input: '$statuses', cond: { $eq: ['$$this', 'accepted'] } } } },
              '$count'
            ]
          }
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

// Get overall statistics
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get basic counts
    const totalApplications = await Application.countDocuments({ user: userId });
    
    const statusCounts = await Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get monthly applications for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await Application.aggregate([
      {
        $match: {
          user: userId,
          appliedDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get job type distribution
    const jobTypeDistribution = await Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);

    // Get success rate
    const acceptedCount = statusCounts.find(s => s._id === 'accepted')?.count || 0;
    const successRate = totalApplications > 0 ? (acceptedCount / totalApplications) * 100 : 0;

    // Get average applications per month
    const currentDate = new Date();
    const monthsSinceFirst = await Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, firstApp: { $min: '$appliedDate' } } }
    ]);

    let avgPerMonth = 0;
    if (monthsSinceFirst.length > 0 && monthsSinceFirst[0].firstApp) {
      const monthsDiff = (currentDate.getFullYear() - monthsSinceFirst[0].firstApp.getFullYear()) * 12 + 
                        (currentDate.getMonth() - monthsSinceFirst[0].firstApp.getMonth()) + 1;
      avgPerMonth = monthsDiff > 0 ? totalApplications / monthsDiff : 0;
    }

    res.json({
      success: true,
      data: {
        totalApplications,
        statusCounts,
        monthlyApplications,
        jobTypeDistribution,
        successRate: Math.round(successRate * 100) / 100,
        avgApplicationsPerMonth: Math.round(avgPerMonth * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics'
    });
  }
};

module.exports = {
  getTrends,
  getTopCompanies,
  getStats
};
