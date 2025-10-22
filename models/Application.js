const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  applicationDate: {
    type: Date,
    required: [true, 'Application date is required'],
    default: Date.now
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Applied', 'Under Review', 'Interview', 'Accepted', 'Rejected', 'Withdrawn'],
      message: 'Status must be one of: Applied, Under Review, Interview, Accepted, Rejected, Withdrawn'
    },
    default: 'Applied'
  },
  applicationType: {
    type: String,
    required: [true, 'Application type is required'],
    enum: {
      values: ['Summer', 'Winter', 'Fall', 'Spring', 'Full-time', 'Part-time'],
      message: 'Application type must be one of: Summer, Winter, Fall, Spring, Full-time, Part-time'
    }
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
    maxlength: [100, 'Source cannot exceed 100 characters']
  },

  jobLink: {
    type: String,
    trim: true,
    maxlength: [500, 'Job link cannot exceed 500 characters'],
    default: ''
  },
  resumeVersion: {
    type: String,
    trim: true,
    maxlength: [100, 'Resume version cannot exceed 100 characters'],
    default: ''
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person cannot exceed 100 characters'],
    default: ''
  },
  contactEmail: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact email cannot exceed 100 characters'],
    default: ''
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: ''
  },
  followUpDate: {
    type: Date,
    default: null
  },
  interviewRounds: [{
    round: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Round name cannot exceed 100 characters']
    },
    date: {
      type: Date,
      required: true
    },
    result: {
      type: String,
      required: true,
      enum: {
        values: ['Pending', 'Completed', 'Passed', 'Failed', 'Cancelled'],
        message: 'Result must be one of: Pending, Completed, Passed, Failed, Cancelled'
      }
    }
  }],
  offerDetails: {
    stipend: {
      type: String,
      trim: true,
      maxlength: [100, 'Stipend cannot exceed 100 characters'],
      default: ''
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [100, 'Duration cannot exceed 100 characters'],
      default: ''
    },
    startDate: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
applicationSchema.index({ user: 1, applicationDate: -1 });
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, companyName: 1 });

module.exports = mongoose.model('Application', applicationSchema);
