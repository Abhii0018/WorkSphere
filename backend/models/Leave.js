const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
    index: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Personal Leave'],
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    required: true,
    min: 0.5,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  appliedOn: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  reviewNote: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: String,
    default: null,
  },
  reviewedBy: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Leave', LeaveSchema);
