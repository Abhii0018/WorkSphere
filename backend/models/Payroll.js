const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
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
  designation: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
    index: true,
  },
  year: {
    type: Number,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  allowances: {
    type: Number,
    default: 0,
  },
  hra: {
    type: Number,
    default: 0,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  paymentDate: {
    type: String,
    default: null,
  },
  paymentMethod: {
    type: String,
    default: 'Direct Deposit',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payroll', PayrollSchema);
