const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  company: { type: String },
  atsScore: { type: Number, required: true },
  skillsMatched: [String],
  skillsMissing: [String],
  feedback: { type: String },
  bulletPointRewrites: [{
    original: { type: String },
    recommended: { type: String },
    reason: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
