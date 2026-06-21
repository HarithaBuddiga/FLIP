const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    cardsReviewed: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizCorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizTotalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProgress', userProgressSchema);
