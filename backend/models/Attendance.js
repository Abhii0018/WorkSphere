const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  checkIn: {
    type: String,
    default: null,
  },
  checkOut: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent', 'Half Day', 'On Leave'],
    default: 'Present',
  },
  workingHours: {
    type: String,
    default: '0 hrs',
  },
  timezone: {
    type: String,
    default: 'America/Chicago',
  },
  note: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Composite index to ensure one attendance record per employee per date
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
