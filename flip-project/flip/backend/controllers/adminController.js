const User = require('../models/User');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const QuizAttempt = require('../models/QuizAttempt');

const starterWorlds = [
  {
    title: 'Beginner English Vocabulary',
    description: 'Essential everyday English words with clear meanings.',
    category: 'Language',
    difficulty: 'Beginner',
    cards: [
      ['Abundant', 'Existing in large quantities.'],
      ['Brief', 'Short in time or length.'],
      ['Accurate', 'Correct or exact.'],
      ['Improve', 'To make something better.'],
      ['Journey', 'An act of traveling from one place to another.'],
    ],
  },
  {
    title: 'Travel English Basics',
    description: 'Useful words for airports, hotels, and travel situations.',
    category: 'Language',
    difficulty: 'Beginner',
    cards: [
      ['Airport', 'A place where airplanes arrive and leave.'],
      ['Luggage', 'Bags used when traveling.'],
      ['Reservation', 'An arrangement made in advance.'],
      ['Destination', 'The place someone is going to.'],
      ['Boarding pass', 'A document that lets a passenger board a plane.'],
    ],
  },
];

const getAnalytics = async (req, res, next) => {
  try {
    const [users, decks, cards, publicDecks, officialDecks, quizAttempts] = await Promise.all([
      User.countDocuments(),
      Deck.countDocuments(),
      Card.countDocuments(),
      Deck.countDocuments({ isPublic: true }),
      Deck.countDocuments({ isOfficial: true }),
      QuizAttempt.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { users, decks, cards, publicDecks, officialDecks, quizAttempts },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { users, count: users.length } });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const update = {};
    if (['user', 'admin'].includes(role)) update.role = role;
    if (typeof isActive === 'boolean') update.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const getDecks = async (req, res, next) => {
  try {
    const decks = await Deck.find().populate('createdBy', 'name email role').sort({ updatedAt: -1 });
    res.json({ success: true, data: { decks, count: decks.length } });
  } catch (error) {
    next(error);
  }
};

const createDeck = async (req, res, next) => {
  try {
    const { title, description, category, isPublic, isOfficial, isFeatured, difficulty } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Deck title is required.' });

    const deck = await Deck.create({
      title,
      description,
      category: category || 'General',
      isPublic: Boolean(isPublic || isOfficial),
      isOfficial: Boolean(isOfficial),
      isFeatured: Boolean(isFeatured),
      difficulty: difficulty || 'Beginner',
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: { deck } });
  } catch (error) {
    next(error);
  }
};

const updateDeck = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'category', 'isPublic', 'isOfficial', 'isFeatured', 'difficulty'];
    const update = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    if (update.isOfficial) update.isPublic = true;
    const deck = await Deck.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found.' });
    res.json({ success: true, data: { deck } });
  } catch (error) {
    next(error);
  }
};

const deleteDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found.' });
    await Card.deleteMany({ deckId: deck._id });
    await deck.deleteOne();
    res.json({ success: true, message: 'Deck deleted.' });
  } catch (error) {
    next(error);
  }
};

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ deckId: req.params.deckId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { cards, count: cards.length } });
  } catch (error) {
    next(error);
  }
};

const createCard = async (req, res, next) => {
  try {
    const { deckId, front, back } = req.body;
    if (!deckId || !front?.trim() || !back?.trim()) {
      return res.status(400).json({ success: false, message: 'deckId, front, and back are required.' });
    }
    const card = await Card.create({ deckId, front, back });
    const cardCount = await Card.countDocuments({ deckId });
    await Deck.findByIdAndUpdate(deckId, { cardCount });
    res.status(201).json({ success: true, data: { card } });
  } catch (error) {
    next(error);
  }
};

const updateCard = async (req, res, next) => {
  try {
    const { front, back } = req.body;
    const card = await Card.findByIdAndUpdate(req.params.id, { front, back }, { new: true });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found.' });
    res.json({ success: true, data: { card } });
  } catch (error) {
    next(error);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found.' });
    const deckId = card.deckId;
    await card.deleteOne();
    const cardCount = await Card.countDocuments({ deckId });
    await Deck.findByIdAndUpdate(deckId, { cardCount });
    res.json({ success: true, message: 'Card deleted.' });
  } catch (error) {
    next(error);
  }
};

const createStarterWorlds = async (req, res, next) => {
  try {
    const created = [];
    for (const world of starterWorlds) {
      let deck = await Deck.findOne({ title: world.title, isOfficial: true });
      if (!deck) {
        deck = await Deck.create({
          title: world.title,
          description: world.description,
          category: world.category,
          difficulty: world.difficulty,
          isPublic: true,
          isOfficial: true,
          isFeatured: true,
          createdBy: req.user._id,
        });
        const cards = world.cards.map(([front, back]) => ({ deckId: deck._id, front, back }));
        await Card.insertMany(cards);
        deck.cardCount = cards.length;
        await deck.save();
      }
      created.push(deck);
    }

    res.status(201).json({ success: true, data: { decks: created } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
