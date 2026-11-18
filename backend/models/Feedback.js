const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Workplace & Culture', 'Tools & Technology', 'Benefits & Policy', 'General Suggestion'],
    default: 'General Suggestion',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  message: {
    type: String,
    required: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Submitted', 'Reviewed', 'Addressed'],
    default: 'Submitted',
  },
  adminResponse: {
    type: String,
    default: '',
  },
  respondedBy: {
    type: String,
    default: null,
  },
  respondedAt: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
