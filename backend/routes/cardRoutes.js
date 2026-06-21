const express = require('express');
const { body } = require('express-validator');
const { getCards, getDueCards, createCard, bulkCreateCards, updateCard, deleteCard } = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const cardValidation = [
  body('front').trim().notEmpty().withMessage('Card front is required'),
  body('back').trim().notEmpty().withMessage('Card back is required'),
  body('deckId').notEmpty().withMessage('Deck ID is required'),
];

router.use(protect);

router.get('/:deckId', getCards);
router.get('/:deckId/due', getDueCards);
router.post('/', cardValidation, createCard);
router.post('/bulk', bulkCreateCards);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;
