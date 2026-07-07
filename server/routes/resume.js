const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { analyzeResume, getAnalyses, deleteAnalysis } = require('../controllers/resumeController');

router.post('/analyze', auth, analyzeResume);
router.get('/history', auth, getAnalyses);
router.delete('/history/:id', auth, deleteAnalysis);

module.exports = router;
