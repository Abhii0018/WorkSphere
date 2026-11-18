const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Helper to get Chicago date string (YYYY-MM-DD)
function getChicagoDate() {
  const d = new Date();
  const options = { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(d);
}

// Helper to format time (e.g. 09:15 AM)
function formatChicagoTime() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Calculate hours between two time strings like "08:55 AM" and "05:30 PM"
function calculateHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '0.00 hrs';
  try {
    const parseTime = (str) => {
      const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3].toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    const diffMins = Math.max(0, parseTime(checkOut) - parseTime(checkIn));
    const hours = (diffMins / 60).toFixed(2);
    return `${hours} hrs`;
  } catch (e) {
    return '0.00 hrs';
  }
}

// GET /api/attendance/today - Today's attendance & dashboard metrics
router.get('/today', async (req, res) => {
  try {
    const today = req.query.date || getChicagoDate();
    const employees = await Employee.find({ role: 'employee', status: 'Active' });
    const records = await Attendance.find({ date: today });

    // Build map of employeeId -> attendance
    const attendanceMap = {};
    records.forEach(r => { attendanceMap[r.employeeId] = r; });

    let present = 0;
    let late = 0;
    let absent = 0;

    const list = employees.map(emp => {
      const record = attendanceMap[emp.employeeId];
      let status = record ? record.status : 'Absent';
      if (status === 'Present') present++;
      else if (status === 'Late') late++;
      else absent++;

      return {
        id: record ? record._id : `virtual-${emp.employeeId}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        name: emp.name,
        department: emp.department,
        designation: emp.designation,
        date: today,
        checkIn: record ? record.checkIn : null,
        checkOut: record ? record.checkOut : null,
        status: status,
        workingHours: record ? record.workingHours : '0.00 hrs',
        timezone: 'America/Chicago',
      };
    });

    const total = employees.length || 6;
    const attended = present + late;
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;

    res.json({
      success: true,
      date: today,
      metrics: {
        totalEmployees: total,
        present,
        late,
        absent,
        attendanceRate,
      },
      data: list,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/employee/:employeeId - History for an employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const records = await Attendance.find({ employeeId: req.params.employeeId })
      .sort({ date: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/check-in
router.post('/check-in', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required' });
    }

    const today = getChicagoDate();
    const nowTime = formatChicagoTime();

    // Determine status (Late if after 9:15 AM Chicago time)
    let isLate = false;
    const match = nowTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const mer = match[3].toUpperCase();
      if ((mer === 'AM' && (h > 9 || (h === 9 && m > 15))) || (mer === 'PM' && h !== 12)) {
        isLate = true;
      }
    }

    let record = await Attendance.findOne({ employeeId, date: today });
    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
        data: record,
      });
    }

    if (!record) {
      record = new Attendance({
        employeeId,
        date: today,
        checkIn: nowTime,
        status: isLate ? 'Late' : 'Present',
        timezone: 'America/Chicago',
      });
    } else {
      record.checkIn = nowTime;
      record.status = isLate ? 'Late' : 'Present';
    }

    await record.save();

    res.json({
      success: true,
      message: 'Check-in recorded in MongoDB',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/attendance/check-out
router.post('/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required' });
    }

    const today = getChicagoDate();
    const nowTime = formatChicagoTime();

    let record = await Attendance.findOne({ employeeId, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out before checking in',
      });
    }

    record.checkOut = nowTime;
    record.workingHours = calculateHours(record.checkIn, nowTime);
    await record.save();

    res.json({
      success: true,
      message: 'Check-out recorded in MongoDB',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
