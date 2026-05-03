const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, admin } = require('../middleware/auth');

// Get all projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project details including tasks
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .populate('completedBy', 'name');
    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new project (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.create({ name, description, members: members || [], createdBy: req.user._id });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modify project (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.name = name || project.name;
    project.description = description || project.description;
    if (members) project.members = members;
    
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
