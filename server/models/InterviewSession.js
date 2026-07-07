const mongoose = require('mongoose');

const QuestionResultSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  aiFeedback: String,
  score: Number,        // 0-10
  strongPoints: String,
  improvements: String,
});

const InterviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: String,
  role: String,
  difficulty: String,
  questions: [QuestionResultSchema],
  overallScore: Number,
  overallFeedback: String,
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);
