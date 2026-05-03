const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { protect, admin } = require('../middleware/auth');

// Get advanced dashboard analytics
router.get('/dashboard', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'ADMIN' ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(filter);
    
    // Status distribution
    const statusCounts = {
      PENDING: tasks.filter(t => t.status === 'PENDING').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length
    };

    // Recent Activity
    const activityQuery = req.user.role === 'ADMIN' ? {} : { user: req.user._id };
    const recentActivity = await ActivityLog.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('task', 'title')
      .populate('project', 'name');

    res.json({
      totalTasks: tasks.length,
      statusCounts,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
