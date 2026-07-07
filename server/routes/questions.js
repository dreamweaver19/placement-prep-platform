const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getQuestions, addQuestion, upvoteQuestion, getCompanies } = require('../controllers/questionController');

router.get('/companies', auth, getCompanies);
router.get('/', auth, getQuestions);
router.post('/', auth, addQuestion);
router.put('/:id/upvote', auth, upvoteQuestion);

module.exports = router;