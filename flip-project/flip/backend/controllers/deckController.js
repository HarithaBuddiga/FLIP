const { validationResult } = require('express-validator');
const Deck = require('../models/Deck');
const Card = require('../models/Card');

const attachCardCounts = async (decks) => {
  const deckList = Array.isArray(decks) ? decks : [decks];
  const ids = deckList.map((deck) => deck._id);
  const counts = await Card.aggregate([
    { $match: { deckId: { $in: ids } } },
    { $group: { _id: '$deckId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.count]));

  return deckList.map((deck) => {
    const deckObject = typeof deck.toObject === 'function' ? deck.toObject() : deck;
    return {
      ...deckObject,
      cardCount: countMap.get(deckObject._id.toString()) || 0,
    };
  });
};

// @desc    Get all decks for current user
// @route   GET /api/decks
// @access  Private
const getDecks = async (req, res, next) => {
  try {
    const decks = await Deck.find({ createdBy: req.user._id }).sort({ updatedAt: -1 });
    const decksWithCounts = await attachCardCounts(decks);
    res.json({ success: true, data: { decks: decksWithCounts, count: decksWithCounts.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single deck by ID
// @route   GET /api/decks/:id
// @access  Private (owner or public deck)
const getDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id).populate('createdBy', 'name');
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found.' });
    }

    // Allow access if owner or deck is public
    const isOwner = deck.createdBy._id.toString() === req.user._id.toString();
    if (!isOwner && !deck.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [deckWithCount] = await attachCardCounts(deck);
    res.json({ success: true, data: { deck: deckWithCount, isOwner } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new deck
// @route   POST /api/decks
// @access  Private
const createDeck = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, description, category, isPublic } = req.body;
    const deck = await Deck.create({
      title,
      description,
      category: category || 'General',
      isPublic: isPublic || false,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Deck created.', data: { deck } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a deck
// @route   PUT /api/decks/:id
// @access  Private (owner only)
const updateDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found.' });
    }
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this deck.' });
    }

    const { title, description, category, isPublic } = req.body;
    deck.title = title ?? deck.title;
    deck.description = description ?? deck.description;
    deck.category = category ?? deck.category;
    deck.isPublic = isPublic ?? deck.isPublic;

    await deck.save();
    res.json({ success: true, message: 'Deck updated.', data: { deck } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a deck and all its cards
// @route   DELETE /api/decks/:id
// @access  Private (owner only)
const deleteDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found.' });
    }
    if (deck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this deck.' });
    }

    // Cascade delete all cards in the deck
    await Card.deleteMany({ deckId: deck._id });
    await deck.deleteOne();

    res.json({ success: true, message: 'Deck and its cards deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clone a public/official deck into current user's library
// @route   POST /api/decks/:id/clone
// @access  Private
const cloneDeck = async (req, res, next) => {
  try {
    const sourceDeck = await Deck.findById(req.params.id);
    if (!sourceDeck) {
      return res.status(404).json({ success: false, message: 'Deck not found.' });
    }
    if (!sourceDeck.isPublic && sourceDeck.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only public decks can be cloned.' });
    }

    const clonedDeck = await Deck.create({
      title: `${sourceDeck.title} Copy`,
      description: sourceDeck.description,
      category: sourceDeck.category,
      difficulty: sourceDeck.difficulty || 'Beginner',
      isPublic: false,
      isOfficial: false,
      isFeatured: false,
      clonedFrom: sourceDeck._id,
      createdBy: req.user._id,
    });

    const sourceCards = await Card.find({ deckId: sourceDeck._id });
    if (sourceCards.length > 0) {
      const cards = sourceCards.map((card) => ({
        deckId: clonedDeck._id,
        front: card.front,
        back: card.back,
      }));
      await Card.insertMany(cards);
      clonedDeck.cardCount = cards.length;
      await clonedDeck.save();
    }

    res.status(201).json({ success: true, message: 'Deck added to your library.', data: { deck: clonedDeck } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public decks
// @route   GET /api/decks/public
// @access  Private
const getPublicDecks = async (req, res, next) => {
  try {
    const decks = await Deck.find({ isPublic: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    const decksWithCounts = await attachCardCounts(decks);
    res.json({ success: true, data: { decks: decksWithCounts, count: decksWithCounts.length } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDecks, getDeck, createDeck, updateDeck, deleteDeck, cloneDeck, getPublicDecks };
