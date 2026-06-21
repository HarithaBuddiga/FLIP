const { validationResult } = require('express-validator');
const Card = require('../models/Card');
const Deck = require('../models/Deck');

// Helper: verify deck ownership or public access
const verifyDeckAccess = async (deckId, userId, requireOwnership = false) => {
  const deck = await Deck.findById(deckId);
  if (!deck) return { error: 'Deck not found.', status: 404 };

  const isOwner = deck.createdBy.toString() === userId.toString();
  if (requireOwnership && !isOwner) {
    return { error: 'Not authorized.', status: 403 };
  }
  if (!isOwner && !deck.isPublic) {
    return { error: 'Access denied.', status: 403 };
  }
  return { deck, isOwner };
};

// @desc    Get all cards in a deck
// @route   GET /api/cards/:deckId
// @access  Private
const getCards = async (req, res, next) => {
  try {
    const access = await verifyDeckAccess(req.params.deckId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const cards = await Card.find({ deckId: req.params.deckId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { cards, count: cards.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cards due for review in a deck
// @route   GET /api/cards/:deckId/due
// @access  Private
const getDueCards = async (req, res, next) => {
  try {
    const access = await verifyDeckAccess(req.params.deckId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const now = new Date();
    const dueCards = await Card.find({
      deckId: req.params.deckId,
      nextReviewDate: { $lte: now },
    }).sort({ nextReviewDate: 1 }); // Oldest due cards first

    res.json({ success: true, data: { cards: dueCards, count: dueCards.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a card in a deck
// @route   POST /api/cards
// @access  Private (owner only)
const createCard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { deckId, front, back } = req.body;

    const access = await verifyDeckAccess(deckId, req.user._id, true);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const card = await Card.create({ deckId, front, back });

    // Update deck's denormalized card count
    await Deck.findByIdAndUpdate(deckId, { $inc: { cardCount: 1 } });

    res.status(201).json({ success: true, message: 'Card created.', data: { card } });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create cards in a deck
// @route   POST /api/cards/bulk
// @access  Private (owner only)
const bulkCreateCards = async (req, res, next) => {
  try {
    const { deckId, cards } = req.body;

    if (!deckId || !Array.isArray(cards)) {
      return res.status(400).json({ success: false, message: 'deckId and cards array are required.' });
    }

    const access = await verifyDeckAccess(deckId, req.user._id, true);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const normalizedCards = cards
      .map((card) => ({
        front: String(card.front || '').trim(),
        back: String(card.back || '').trim(),
      }))
      .filter((card) => card.front && card.back);

    if (normalizedCards.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid cards found to import.' });
    }

    if (normalizedCards.length > 300) {
      return res.status(400).json({ success: false, message: 'You can import up to 300 cards at a time.' });
    }

    const existingCards = await Card.find({ deckId }).select('front back');
    const existingKeys = new Set(existingCards.map((card) => `${card.front.trim().toLowerCase()}::${card.back.trim().toLowerCase()}`));
    const batchKeys = new Set();
    const uniqueCards = [];
    const duplicates = [];

    normalizedCards.forEach((card, index) => {
      const key = `${card.front.toLowerCase()}::${card.back.toLowerCase()}`;
      if (existingKeys.has(key) || batchKeys.has(key)) {
        duplicates.push({ index, front: card.front, back: card.back });
        return;
      }
      batchKeys.add(key);
      uniqueCards.push({ ...card, deckId });
    });

    if (uniqueCards.length === 0) {
      return res.status(409).json({
        success: false,
        message: 'All imported cards are duplicates.',
        data: { duplicates },
      });
    }

    const createdCards = await Card.insertMany(uniqueCards);
    const cardCount = await Card.countDocuments({ deckId });
    await Deck.findByIdAndUpdate(deckId, { cardCount });

    res.status(201).json({
      success: true,
      message: `${createdCards.length} cards imported.`,
      data: {
        cards: createdCards,
        count: createdCards.length,
        skippedDuplicates: duplicates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a card
// @route   PUT /api/cards/:id
// @access  Private (deck owner only)
const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    const access = await verifyDeckAccess(card.deckId, req.user._id, true);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const { front, back } = req.body;
    card.front = front ?? card.front;
    card.back = back ?? card.back;
    await card.save();

    res.json({ success: true, message: 'Card updated.', data: { card } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a card
// @route   DELETE /api/cards/:id
// @access  Private (deck owner only)
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    const access = await verifyDeckAccess(card.deckId, req.user._id, true);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    await card.deleteOne();
    const cardCount = await Card.countDocuments({ deckId: card.deckId });
    await Deck.findByIdAndUpdate(card.deckId, { cardCount });

    res.json({ success: true, message: 'Card deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCards, getDueCards, createCard, bulkCreateCards, updateCard, deleteCard };
