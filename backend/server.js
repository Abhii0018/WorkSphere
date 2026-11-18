require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const taskRoutes = require('./routes/tasks');
const payrollRoutes = require('./routes/payroll');
const announcementRoutes = require('./routes/announcements');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'WorkSphere HR Backend',
    company: 'Visartech',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 WorkSphere Backend Server running on port ${PORT}`);
    console.log(`📡 Local:   http://localhost:${PORT}`);
    console.log(`📡 Network: http://10.224.16.129:${PORT}`);
    console.log(`🍃 Database: MongoDB Atlas (worksphere)`);
    console.log(`===============================================`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
