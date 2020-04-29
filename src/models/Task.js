const mongoose = require('mongoose');

const taskDefinition = {
  description: {
    type: String,
    trim: true,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
};

const options = {
  timestamps: true,
};

const taskSchema = new mongoose.Schema(taskDefinition, options);
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
