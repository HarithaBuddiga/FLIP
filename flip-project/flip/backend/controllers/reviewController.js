const Card = require('../models/Card');
const Deck = require('../models/Deck');
const { applyProgressActivity, ensureProgress, toProgressStats } = require('../utils/progress');

// SRS interval map — simple MVP version
const INTERVALS = {
  hard: 1,  // +1 day
  good: 3,  // +3 days
  easy: 7,  // +7 days
};

// @desc    Submit a review for a card (SRS update)
// @route   POST /api/review/:cardId
// @access  Private
const submitReview = async (req, res, next) => {
  try {
    const { rating } = req.body; // 'hard' | 'good' | 'easy'

    if (!['hard', 'good', 'easy'].includes(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be 'hard', 'good', or 'easy'.",
      });
    }

    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    // Only deck owners can write SRS data. Public decks are still readable,
    // but shared scheduling state must not be mutated by other users.
    const deck = await Deck.findById(card.deckId);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Associated deck not found.' });
    }

    const isOwner = deck.createdBy.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the deck owner can submit reviews for this deck.',
      });
    }

    // Calculate next review date
    const daysToAdd = INTERVALS[rating];
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

    // Update card SRS fields
    card.reviewCount += 1;
    card.lastReviewed = new Date();
    card.nextReviewDate = nextReviewDate;
    card.difficulty = rating;
    await card.save();

    const xpByRating = { hard: 8, good: 12, easy: 16 };
    const progress = await applyProgressActivity(req.user._id, {
      xp: xpByRating[rating],
      cardsReviewed: 1,
    });

    res.json({
      success: true,
      message: 'Review recorded.',
      data: {
        card,
        nextReviewDate,
        daysUntilNextReview: daysToAdd,
        xpEarned: xpByRating[rating],
        progress: toProgressStats(progress),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats for current user
// @route   GET /api/review/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all decks for user
    const decks = await Deck.find({ createdBy: userId });
    const deckIds = decks.map((d) => d._id);

    // Total cards across all decks
    const totalCards = await Card.countDocuments({ deckId: { $in: deckIds } });

    // Cards due today
    const now = new Date();
    const cardsDueToday = await Card.countDocuments({
      deckId: { $in: deckIds },
      nextReviewDate: { $lte: now },
    });

    // Recently studied decks (decks with cards reviewed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyStudiedDeckIds = await Card.distinct('deckId', {
      deckId: { $in: deckIds },
      lastReviewed: { $gte: sevenDaysAgo },
    });

    const recentDecks = await Deck.find({ _id: { $in: recentlyStudiedDeckIds } }).limit(5);
    const progress = await ensureProgress(userId);

    res.json({
      success: true,
      data: {
        totalDecks: decks.length,
        totalCards,
        cardsDueToday,
        recentDecks,
        progress: toProgressStats(progress),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitReview, getDashboardStats };
