const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  basicSalary: { type: Number, default: 5000 },
  allowances: { type: Number, default: 800 },
  hra: { type: Number, default: 1200 },
  deductions: { type: Number, default: 500 },
  netSalary: { type: Number, default: 6500 },
}, { _id: false });

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['hr_admin', 'employee'],
    default: 'employee',
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  joiningDate: {
    type: String,
    default: '2023-01-15',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: 'Chicago, IL (Visartech HQ)',
  },
  salary: {
    type: SalarySchema,
    default: () => ({}),
  },
  password: {
    type: String,
    default: '$2a$10$wK1Rk8B1iGv5sXJbM64mfeQ6eE6zE5TzW8L6sL8X1wK1Rk8B1iGv5', // hashed default
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Employee', EmployeeSchema);
