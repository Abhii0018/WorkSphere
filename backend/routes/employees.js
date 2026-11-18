const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// GET /api/employees - list all employees (or filter by status/search)
router.get('/', async (req, res) => {
  try {
    const { search, status, role } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(query).sort({ employeeId: 1 });
    // Transform to frontend format (id = employeeId)
    const formatted = employees.map(e => ({
      id: e.employeeId,
      employeeId: e.employeeId,
      name: e.name,
      email: e.email,
      phone: e.phone,
      role: e.role,
      department: e.department,
      designation: e.designation,
      title: e.designation,
      joiningDate: e.joiningDate,
      joinDate: e.joiningDate,
      status: e.status,
      avatar: e.avatar,
      location: e.location,
      salary: e.salary,
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const emp = await Employee.findOne({
      $or: [{ employeeId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }],
    });

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: {
        id: emp.employeeId,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        department: emp.department,
        designation: emp.designation,
        title: emp.designation,
        joiningDate: emp.joiningDate,
        joinDate: emp.joiningDate,
        status: emp.status,
        avatar: emp.avatar,
        location: emp.location,
        salary: emp.salary,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/employees - create new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, status } = req.body;

    // Generate next emp-id if not provided
    const lastEmp = await Employee.find({ employeeId: { $regex: '^emp-' } }).sort({ employeeId: -1 }).limit(1);
    let nextNum = 107;
    if (lastEmp.length > 0) {
      const match = lastEmp[0].employeeId.match(/emp-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const employeeId = req.body.employeeId || `emp-${nextNum}`;

    const defaultPassword = await bcrypt.hash('visartech2026', 10);
    const newEmployee = new Employee({
      employeeId,
      name,
      email,
      phone: phone || '+1 (312) 555-0199',
      department: department || 'Digital Solutions Lab',
      designation: designation || 'Software Engineer',
      salary: salary || { basicSalary: 6000, allowances: 1200, hra: 900, deductions: 500, netSalary: 7600 },
      status: status || 'Active',
      avatar: name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'EM',
      password: defaultPassword,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully in MongoDB',
      data: {
        id: newEmployee.employeeId,
        employeeId: newEmployee.employeeId,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        designation: newEmployee.designation,
        status: newEmployee.status,
        salary: newEmployee.salary,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/employees/:id - update employee details
router.put('/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updates = req.body;

    const emp = await Employee.findOne({ employeeId });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (updates.name) emp.name = updates.name;
    if (updates.email) emp.email = updates.email;
    if (updates.phone) emp.phone = updates.phone;
    if (updates.department) emp.department = updates.department;
    if (updates.designation) emp.designation = updates.designation;
    if (updates.status) emp.status = updates.status;
    if (updates.salary) emp.salary = { ...emp.salary, ...updates.salary };

    await emp.save();

    res.json({
      success: true,
      message: 'Employee updated successfully in MongoDB',
      data: {
        id: emp.employeeId,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        designation: emp.designation,
        status: emp.status,
        salary: emp.salary,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
