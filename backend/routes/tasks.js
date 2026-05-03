const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Commit = require('../models/Commit');
const crypto = require('crypto');
const { protect, admin } = require('../middleware/auth');

// Helper to log activity
const logActivity = async (action, details, userId, taskId = null, projectId = null) => {
  await ActivityLog.create({ action, details, user: userId, task: taskId, project: projectId });
};

// Get all tasks
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'ADMIN' ? {} : { assignedTo: { $in: [req.user._id] } };
    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .populate('completedBy', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, priority, dueDate, project, assignedTo } = req.body;
    const task = await Task.create({ title, description, priority: priority || 'Medium', dueDate, project, assignedTo, createdBy: req.user._id });
    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name').populate('project', 'name');
    
    await logActivity('TASK_CREATED', `Created task: ${title}`, req.user._id, task._id, project);
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role !== 'ADMIN' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldStatus = task.status;
    const newStatus = req.body.status || task.status;
    task.status = newStatus;
    
    // Manage completedBy tracking
    if (newStatus === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      task.completedBy = req.user._id;
    } else if (newStatus !== 'COMPLETED') {
      task.completedBy = undefined;
    }
    
    await task.save();

    if (oldStatus !== task.status) {
      await logActivity('STATUS_UPDATED', `Changed status from ${oldStatus} to ${task.status}`, req.user._id, task._id, task.project);
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit task (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    
    await logActivity('TASK_MODIFIED', `Modified task: ${task.title}`, req.user._id, task._id, task.project);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a GitHub-style Commit to a task
router.post('/:id/commits', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Generate a 7-character GitHub-style commit hash
    const commitHash = crypto.randomBytes(4).toString('hex').slice(0, 7);

    const commit = await Commit.create({ 
      message: req.body.message || req.body.text, 
      task: task._id, 
      user: req.user._id,
      commitHash 
    });
    await commit.populate('user', 'name');
    
    await logActivity('COMMIT_ADDED', `Pushed commit ${commitHash} to task: ${task.title}`, req.user._id, task._id, task.project);
    res.status(201).json(commit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get commits for a task
router.get('/:id/commits', protect, async (req, res) => {
  try {
    const commits = await Commit.find({ task: req.params.id }).populate('user', 'name').sort({ createdAt: -1 });
    res.json(commits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    await logActivity('TASK_DELETED', `Deleted task: ${task.title}`, req.user._id, null, task.project);
    await task.deleteOne();
    await Commit.deleteMany({ task: task._id });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
