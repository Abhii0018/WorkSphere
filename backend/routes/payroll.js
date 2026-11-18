const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// GET /api/payroll - list payroll records with filters
router.get('/', async (req, res) => {
  try {
    const { month, status, employeeId, search } = req.query;
    let query = {};
    if (month && month !== 'All') query.month = month;
    if (status && status !== 'All') query.status = status;
    if (employeeId && employeeId !== 'All') query.employeeId = employeeId;
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const records = await Payroll.find(query).sort({ month: -1, employeeId: 1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payroll/summary
router.get('/summary', async (req, res) => {
  try {
    const targetMonth = req.query.month || '2026-03';
    const records = await Payroll.find({ month: targetMonth });

    let totalExpenditure = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;

    records.forEach(r => {
      totalExpenditure += r.netSalary || 0;
      if (r.status === 'Paid') {
        paidAmount += r.netSalary || 0;
        paidCount++;
      } else {
        pendingAmount += r.netSalary || 0;
        pendingCount++;
      }
    });

    res.json({
      success: true,
      month: targetMonth,
      summary: {
        totalMonthlyPayroll: totalExpenditure,
        totalExpenditure,
        paidAmount,
        pendingAmount,
        totalEmployees: records.length,
        paidCount,
        pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payroll/employee/:employeeId
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const records = await Payroll.find({ employeeId: req.params.employeeId }).sort({ month: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payroll/generate - generate payroll for a month
router.post('/generate', async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ success: false, message: 'Month is required (e.g. 2026-04)' });
    }

    const year = parseInt(month.split('-')[0], 10);
    const activeEmployees = await Employee.find({ role: 'employee', status: 'Active' });

    let createdCount = 0;
    for (const emp of activeEmployees) {
      const id = `pay-${emp.employeeId.replace('emp-', '')}-${month}`;
      const existing = await Payroll.findOne({ id });
      if (!existing) {
        const sal = emp.salary || {};
        const basic = sal.basicSalary || sal.basic || 6000;
        const allowances = sal.allowances || 1500;
        const hra = sal.hra || 1000;
        const deductions = sal.deductions || 600;
        const tax = Math.round(basic * 0.05);
        const net = basic + allowances + hra - deductions - tax;

        await Payroll.create({
          id,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          designation: emp.designation,
          department: emp.department,
          month,
          year,
          basicSalary: basic,
          allowances,
          hra,
          deductions,
          tax,
          netSalary: net,
          status: 'Pending',
        });
        createdCount++;
      }
    }

    const allMonthRecords = await Payroll.find({ month });
    res.json({
      success: true,
      message: `Payroll generated for ${month} (${createdCount} created)`,
      data: allMonthRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/payroll/:id/status - mark as Paid or Pending
router.put('/:id/status', async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;
    const record = await Payroll.findOne({ id: req.params.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    record.status = status;
    if (status === 'Paid') {
      record.paymentDate = new Date().toISOString().split('T')[0];
      if (paymentMethod) record.paymentMethod = paymentMethod;
    } else {
      record.paymentDate = null;
    }

    await record.save();
    res.json({ success: true, message: `Payroll record marked as ${status} in MongoDB`, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/payroll/structure/:employeeId - update employee salary structure
router.put('/structure/:employeeId', async (req, res) => {
  try {
    const { basicSalary, allowances, hra, deductions } = req.body;
    const emp = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const basic = Number(basicSalary) || emp.salary.basicSalary;
    const allow = Number(allowances) || emp.salary.allowances;
    const h = Number(hra) || emp.salary.hra;
    const ded = Number(deductions) || emp.salary.deductions;
    const net = basic + allow + h - ded;

    emp.salary = {
      basicSalary: basic,
      allowances: allow,
      hra: h,
      deductions: ded,
      netSalary: net,
    };

    await emp.save();
    res.json({ success: true, message: 'Salary structure updated in MongoDB', data: emp.salary });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
