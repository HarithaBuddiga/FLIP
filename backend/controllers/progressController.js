const Card = require('../models/Card');
const Deck = require('../models/Deck');
const QuizAttempt = require('../models/QuizAttempt');
const { applyProgressActivity, ensureProgress, toProgressStats } = require('../utils/progress');

const getProfileProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await ensureProgress(userId);
    const decks = await Deck.find({ createdBy: userId });
    const deckIds = decks.map((deck) => deck._id);
    const totalCards = await Card.countDocuments({ deckId: { $in: deckIds } });
    const quizAttempts = await QuizAttempt.find({ userId }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        progress: toProgressStats(progress),
        totals: {
          worlds: decks.length,
          cards: totalCards,
        },
        recentQuizAttempts: quizAttempts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const recordQuizAttempt = async (req, res, next) => {
  try {
    const { deckId, score, totalQuestions } = req.body;

    if (!deckId || typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'deckId, score, and totalQuestions are required.',
      });
    }

    if (totalQuestions < 1 || score < 0 || score > totalQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz score.',
      });
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found.' });
    }

    const isOwner = deck.createdBy.toString() === req.user._id.toString();
    if (!isOwner && !deck.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      deckId,
      score,
      totalQuestions,
      percentage,
    });

    const xp = 20 + score * 10;
    const progress = await applyProgressActivity(req.user._id, {
      xp,
      quizzesCompleted: 1,
      quizCorrectAnswers: score,
      quizTotalQuestions: totalQuestions,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz result recorded.',
      data: {
        attempt,
        progress: toProgressStats(progress),
        xpEarned: xp,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfileProgress, recordQuizAttempt };
