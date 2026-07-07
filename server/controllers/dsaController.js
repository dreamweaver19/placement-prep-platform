const Problem = require('../models/Problem');

// Get all problems for logged in user
exports.getProblems = async (req, res) => {
  try {
    const { status, difficulty, topic } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;

    const problems = await Problem.find(filter).sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add a problem
exports.addProblem = async (req, res) => {
  try {
    const { title, link, difficulty, topic, status, notes } = req.body;
    const problem = new Problem({
      user: req.user.id,
      title, link, difficulty, topic, status, notes
    });
    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a problem
exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a problem
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get stats (for dashboard)
exports.getStats = async (req, res) => {
  try {
    const problems = await Problem.find({ user: req.user.id });
    const total = problems.length;
    const solved = problems.filter(p => p.status === 'Solved').length;
    const attempted = problems.filter(p => p.status === 'Attempted').length;
    const todo = problems.filter(p => p.status === 'Todo').length;

    // Group by topic
    const byTopic = {};
    problems.forEach(p => {
      if (!byTopic[p.topic]) byTopic[p.topic] = { total: 0, solved: 0 };
      byTopic[p.topic].total++;
      if (p.status === 'Solved') byTopic[p.topic].solved++;
    });

    res.json({ total, solved, attempted, todo, byTopic });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};