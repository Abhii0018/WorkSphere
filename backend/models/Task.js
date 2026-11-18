const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  assignedTo: {
    type: String,
    required: true,
    index: true,
  },
  assignedByName: {
    type: String,
    default: 'Elena Rostova (HR Admin)',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending',
  },
  dueDate: {
    type: String,
    required: true,
  },
  completedDate: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: 'Development',
  },
  performanceRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  feedback: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', TaskSchema);
