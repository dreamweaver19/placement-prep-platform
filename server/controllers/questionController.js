const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  try {
    const { company, category, role, difficulty } = req.query;
    const filter = {};
    if (company) filter.company = new RegExp(company, 'i');
    if (category) filter.category = category;
    if (role) filter.role = role;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .populate('contributedBy', 'name')
      .sort({ upvotes: -1, createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { company, role, category, question, answer, difficulty } = req.body;
    const q = new Question({
      company, role, category, question, answer, difficulty,
      contributedBy: req.user.id
    });
    await q.save();
    res.json(q);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.upvoteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!q) return res.status(404).json({ msg: 'Not found' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Question.distinct('company');
    res.json(companies.sort());
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};