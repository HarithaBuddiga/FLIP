const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: true,
    },
    front: {
      type: String,
      required: [true, 'Card front is required'],
      trim: true,
      maxlength: [1000, 'Front text cannot exceed 1000 characters'],
    },
    back: {
      type: String,
      required: [true, 'Card back is required'],
      trim: true,
      maxlength: [2000, 'Back text cannot exceed 2000 characters'],
    },
    // Spaced Repetition System fields
    reviewCount: {
      type: Number,
      default: 0,
    },
    lastReviewed: {
      type: Date,
      default: null,
    },
    nextReviewDate: {
      type: Date,
      default: () => new Date(), // Due immediately on creation
    },
    difficulty: {
      type: String,
      enum: ['hard', 'good', 'easy'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient SRS queries — find cards due for review in a deck
cardSchema.index({ deckId: 1, nextReviewDate: 1 });

module.exports = mongoose.model('Card', cardSchema);
