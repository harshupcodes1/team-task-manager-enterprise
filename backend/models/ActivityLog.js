const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'CREATED_TASK', 'UPDATED_STATUS', 'DELETED_PROJECT'
  details: { type: String, required: true }, // Human readable description
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
