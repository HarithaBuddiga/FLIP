const express = require('express');
const { body } = require('express-validator');
const {
  getDecks,
  getDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  cloneDeck,
  getPublicDecks,
} = require('../controllers/deckController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const deckValidation = [
  body('title').trim().notEmpty().withMessage('Deck title is required').isLength({ max: 100 }).withMessage('Title too long'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('category').optional().isLength({ max: 50 }).withMessage('Category too long'),
];

// All routes require authentication
router.use(protect);

router.get('/public', getPublicDecks);
router.get('/', getDecks);
router.get('/:id', getDeck);
router.post('/:id/clone', cloneDeck);
router.post('/', deckValidation, createDeck);
router.put('/:id', updateDeck);
router.delete('/:id', deleteDeck);

module.exports = router;
