const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getProblems, addProblem, updateProblem, deleteProblem, getStats
} = require('../controllers/dsaController');
router.get('/stats', auth, getStats);
router.get('/', auth, getProblems);
router.post('/', auth, addProblem);
router.put('/:id', auth, updateProblem);
router.delete('/:id', auth, deleteProblem);

module.exports = router;
