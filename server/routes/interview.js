const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  generateQuestions, evaluateAnswer,
  saveSession, getSessions, getSession
} = require('../controllers/interviewController');

router.post('/generate', auth, generateQuestions);
router.post('/evaluate', auth, evaluateAnswer);
router.post('/save', auth, saveSession);
router.get('/sessions', auth, getSessions);
router.get('/sessions/:id', auth, getSession);

module.exports = router;