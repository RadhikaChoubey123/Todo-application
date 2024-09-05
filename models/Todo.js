const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['WORK', 'HOME', 'LEARNING'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    required: true,
  },
  status: {
    type: String,
    enum: ['TO DO', 'IN PROGRESS', 'DONE'],
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Todo', todoSchema);
