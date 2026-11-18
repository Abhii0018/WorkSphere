const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// GET /api/feedback
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query;
    let query = {};
    if (employeeId) query.employeeId = employeeId;

    const feedbackList = await Feedback.find(query).sort({ createdAt: -1 });

    // Calculate metrics
    const total = feedbackList.length;
    const avgRating = total > 0 ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1) : 5.0;
    const addressed = feedbackList.filter(f => f.status === 'Addressed').length;
    const pending = total - addressed;

    res.json({
      success: true,
      count: total,
      metrics: {
        totalFeedback: total,
        avgSatisfactionRating: avgRating,
        addressedCount: addressed,
        pendingReviewCount: pending,
      },
      data: feedbackList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/feedback - Employee submits feedback
router.post('/', async (req, res) => {
  try {
    const { employeeId, employeeName, category, rating, message, isAnonymous } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Feedback message cannot be empty' });
    }

    const count = await Feedback.countDocuments();
    const id = `fbk-${String(count + 1).padStart(3, '0')}`;

    const feedback = new Feedback({
      id,
      employeeId: employeeId || 'emp-101',
      employeeName: isAnonymous ? 'Anonymous Employee' : (employeeName || 'Visartech Member'),
      category: category || 'General Suggestion',
      rating: Number(rating) || 5,
      message: message.trim(),
      isAnonymous: Boolean(isAnonymous),
      status: 'Submitted',
    });

    await feedback.save();
    res.status(201).json({ success: true, message: 'Feedback submitted to MongoDB', data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/feedback/:id/respond - HR Admin review & response
router.put('/:id/respond', async (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const feedback = await Feedback.findOne({ id: req.params.id });
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback record not found' });
    }

    feedback.adminResponse = adminResponse || 'Reviewed by HR Team';
    feedback.status = status || 'Addressed';
    feedback.respondedBy = 'Elena Rostova (Lead HR Manager)';
    feedback.respondedAt = new Date().toISOString().split('T')[0];

    await feedback.save();
    res.json({ success: true, message: 'Feedback response saved to MongoDB', data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
