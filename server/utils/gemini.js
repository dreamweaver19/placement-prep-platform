const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateContent = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Set GEMINI_API_KEY in server/.env before using mock interviews');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { generateContent };
