const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { status, priority, employeeId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (employeeId) query.assignedTo = employeeId;

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/tasks/employee/:employeeId
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.employeeId }).sort({ dueDate: 1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, category } = req.body;
    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, assignedTo, and dueDate are required' });
    }

    const taskCount = await Task.countDocuments();
    const id = `tsk-${String(taskCount + 1).padStart(3, '0')}`;

    const newTask = new Task({
      id,
      title,
      description: description || '',
      assignedTo,
      priority: priority || 'Medium',
      dueDate,
      category: category || 'Development',
      status: 'Pending',
    });

    await newTask.save();
    res.status(201).json({ success: true, message: 'Task saved in MongoDB', data: newTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/tasks/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    if (status === 'Completed') {
      task.completedDate = new Date().toISOString().split('T')[0];
    }
    await task.save();

    res.json({ success: true, message: 'Task status updated in MongoDB', data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/tasks/:id/performance
router.put('/:id/performance', async (req, res) => {
  try {
    const { performanceRating, feedback } = req.body;
    const task = await Task.findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.performanceRating = performanceRating;
    if (feedback) task.feedback = feedback;
    await task.save();

    res.json({ success: true, message: 'Performance rating saved in MongoDB', data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
