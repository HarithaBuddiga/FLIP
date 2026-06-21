const express = require('express');
const {
  getAnalytics,
  getUsers,
  updateUser,
  getDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  getCards,
  createCard,
  updateCard,
  deleteCard,
  createStarterWorlds,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

router.get('/decks', getDecks);
router.post('/decks', createDeck);
router.put('/decks/:id', updateDeck);
router.delete('/decks/:id', deleteDeck);

router.get('/decks/:deckId/cards', getCards);
router.post('/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);

router.post('/starter-worlds', createStarterWorlds);

module.exports = router;
