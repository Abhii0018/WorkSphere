const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

const DEFAULT_ENTITLEMENTS = {
  'Casual Leave': 10,
  'Sick Leave': 8,
  'Annual Leave': 15,
  'Personal Leave': 5,
};

// GET /api/leaves/employee/:employeeId
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId }).sort({ createdAt: -1 });

    // Calculate balances
    let usedDays = 0;
    let pendingDays = 0;
    let approvedDays = 0;
    let rejectedCount = 0;

    leaves.forEach(l => {
      if (l.status === 'Approved') {
        usedDays += l.days;
        approvedDays += l.days;
      } else if (l.status === 'Pending') {
        pendingDays += l.days;
      } else if (l.status === 'Rejected') {
        rejectedCount++;
      }
    });

    const totalEntitlement = 38; // sum of defaults
    const remainingDays = Math.max(0, totalEntitlement - usedDays);

    res.json({
      success: true,
      data: leaves,
      summary: {
        totalEntitlement,
        usedDays,
        remainingDays,
        pendingCount: leaves.filter(l => l.status === 'Pending').length,
        approvedCount: leaves.filter(l => l.status === 'Approved').length,
        rejectedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leaves/all - for HR Admin
router.get('/all', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });

    const pending = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;

    res.json({
      success: true,
      count: leaves.length,
      metrics: {
        totalRequests: leaves.length,
        pending,
        approved,
        rejected,
      },
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leaves - Apply for leave
router.post('/', async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, days, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emp = await Employee.findOne({ employeeId });
    const employeeName = emp ? emp.name : 'Visartech Employee';

    // Check overlapping pending or approved leave
    const existing = await Leave.find({
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active leave request overlapping these dates.',
      });
    }

    const leaveCount = await Leave.countDocuments();
    const id = `lv-${String(leaveCount + 1).padStart(3, '0')}`;

    const newLeave = new Leave({
      id,
      employeeId,
      employeeName,
      leaveType,
      startDate,
      endDate,
      days: Number(days) || 1,
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted to MongoDB',
      data: newLeave,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/leaves/:id/status - Approve or Reject leave (HR Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, reviewNote, reviewedBy } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findOne({ id: req.params.id });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.reviewNote = reviewNote || (status === 'Approved' ? 'Approved by HR Administrator' : 'Rejected by HR Administrator');
    leave.reviewedAt = new Date().toISOString().split('T')[0];
    leave.reviewedBy = reviewedBy || 'Elena Rostova';

    await leave.save();

    res.json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully in MongoDB`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
