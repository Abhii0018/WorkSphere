const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Company Update', 'Event', 'Policy', 'Urgent', 'Tech Talk'],
    default: 'Company Update',
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal',
  },
  postedBy: {
    type: String,
    default: 'Elena Rostova (HR Admin)',
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
