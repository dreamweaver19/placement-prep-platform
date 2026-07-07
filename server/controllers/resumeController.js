const { generateContent } = require('../utils/gemini');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const parseJsonResponse = (raw) => {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

exports.analyzeResume = async (req, res) => {
  const { resumeText, role, company, jobDescription } = req.body;

  if (!resumeText || !role) {
    return res.status(400).json({ msg: 'Please provide resume text and target role' });
  }

  try {
    const prompt = `
      You are an expert technical recruiter and ATS (Applicant Tracking System) optimizer.
      Analyze the candidate's resume text below against the target role: "${role}" ${company ? `at company: "${company}"` : ''}.
      ${jobDescription ? `Target Job Description:\n${jobDescription}` : ''}

      Resume Text:
      ${resumeText}

      Evaluate the resume and return a JSON object with this exact structure:
      {
        "atsScore": <number between 0 and 100 representing how well the resume matches this target role>,
        "skillsMatched": ["SkillA", "SkillB", ...],
        "skillsMissing": ["SkillC", "SkillD", ...],
        "feedback": "<2-3 sentences of overall styling, format, and content feedback>",
        "bulletPointRewrites": [
          {
            "original": "<an original weak bullet point or project/experience description from the resume>",
            "recommended": "<an optimized version of that bullet point using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'>",
            "reason": "<why this recommendation is better>"
          }
        ]
      }

      Return ONLY the valid JSON object, with no markdown code blocks (e.g. do not wrap in \`\`\`json) and no other text.
    `;

    const raw = await generateContent(prompt);
    let analysisData;
    try {
      analysisData = parseJsonResponse(raw);
    } catch (parseErr) {
      // Fallback in case Gemini returns markdown block even after prompt instruction
      console.warn("JSON parsing failed, trying simple match extraction", parseErr);
      // Let's retry cleaning
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        analysisData = JSON.parse(match[0]);
      } else {
        throw parseErr;
      }
    }

    const analysis = new ResumeAnalysis({
      user: req.user.id,
      role,
      company: company || '',
      atsScore: analysisData.atsScore || 50,
      skillsMatched: analysisData.skillsMatched || [],
      skillsMissing: analysisData.skillsMissing || [],
      feedback: analysisData.feedback || 'No feedback provided.',
      bulletPointRewrites: analysisData.bulletPointRewrites || []
    });

    await analysis.save();
    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to analyze resume' });
  }
};

exports.getAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!analysis) return res.status(404).json({ msg: 'Analysis not found' });
    res.json({ msg: 'Analysis deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
