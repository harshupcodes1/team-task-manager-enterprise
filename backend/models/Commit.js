const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  message: { type: String, required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commitHash: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Commit', commitSchema);
