const { generateContent } = require('../utils/gemini');
const InterviewSession = require('../models/InterviewSession');

const parseJsonResponse = (raw) => {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

exports.generateQuestions = async (req, res) => {
  const { company, role, difficulty } = req.body;

  try {
    const prompt = `
      You are a technical interviewer at ${company}.
      Generate exactly 5 interview questions for a ${role} role at ${difficulty} difficulty level.
      Mix technical and behavioral questions.

      Return ONLY a valid JSON array like this, with no extra text and no markdown:
      [
        { "question": "...", "type": "Technical" },
        { "question": "...", "type": "Behavioral" }
      ]
    `;

    const raw = await generateContent(prompt);
    const questions = parseJsonResponse(raw);
    res.json({ questions });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to generate questions' });
  }
};

exports.evaluateAnswer = async (req, res) => {
  const { question, answer, role } = req.body;

  try {
    const prompt = `
      You are evaluating a ${role} interview answer.

      Question: ${question}
      Candidate answer: ${answer}

      Evaluate and return ONLY valid JSON, with no markdown and no extra text:
      {
        "score": <number 0-10>,
        "feedback": "<2-3 sentences of specific feedback>",
        "strongPoints": "<what was good>",
        "improvements": "<what to improve>"
      }
    `;

    const raw = await generateContent(prompt);
    const evaluation = parseJsonResponse(raw);
    res.json(evaluation);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to evaluate answer' });
  }
};

exports.saveSession = async (req, res) => {
  const { company, role, difficulty, questions } = req.body;

  try {
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ msg: 'No interview answers provided' });
    }

    const totalScore = questions.reduce((sum, question) => sum + (question.score || 0), 0);
    const overallScore = Math.round(totalScore / questions.length);

    const feedbackPrompt = `
      A candidate just completed a ${role} mock interview at ${company}.
      Overall score: ${overallScore}/10.
      Give 2-3 sentences of overall feedback and one key improvement tip.
      Return plain text only, no JSON.
    `;
    const overallFeedback = await generateContent(feedbackPrompt);

    const session = new InterviewSession({
      user: req.user.id,
      company,
      role,
      difficulty,
      questions,
      overallScore,
      overallFeedback,
    });

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to save session' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .select('-questions');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!session) return res.status(404).json({ msg: 'Not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
