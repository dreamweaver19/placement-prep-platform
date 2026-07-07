const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, enum: ['SDE', 'Data Analyst', 'Product', 'DevOps', 'Any'], default: 'SDE' },
  category: { type: String, enum: ['Technical', 'HR', 'Aptitude'], required: true },
  question: { type: String, required: true },
  answer: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  upvotes: { type: Number, default: 0 },
  contributedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);