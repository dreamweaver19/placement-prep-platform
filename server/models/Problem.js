const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  link: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: String, required: true }, // Array, Tree, DP, Graph, etc.
  status: { type: String, enum: ['Todo', 'Attempted', 'Solved'], default: 'Todo' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', ProblemSchema);