const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// GET /api/announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/announcements - HR Admin post
router.post('/', async (req, res) => {
  try {
    const { title, content, category, priority, isPinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const count = await Announcement.countDocuments();
    const id = `ann-${String(count + 1).padStart(3, '0')}`;

    const announcement = new Announcement({
      id,
      title: title.trim(),
      content: content.trim(),
      category: category || 'Company Update',
      priority: priority || 'Normal',
      isPinned: Boolean(isPinned),
      date: new Date().toISOString().split('T')[0],
      postedBy: 'Elena Rostova (Lead HR Manager)',
    });

    await announcement.save();
    res.status(201).json({ success: true, message: 'Announcement published to MongoDB', data: announcement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
  try {
    await Announcement.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Announcement deleted from MongoDB' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
