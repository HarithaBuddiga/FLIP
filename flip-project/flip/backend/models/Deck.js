const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deck title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    clonedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      default: null,
    },
    // Denormalized count for performance — updated on card create/delete
    cardCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient public deck queries and user deck lookups
deckSchema.index({ createdBy: 1, createdAt: -1 });
deckSchema.index({ isPublic: 1, createdAt: -1 });
deckSchema.index({ isOfficial: 1, isFeatured: 1, createdAt: -1 });

module.exports = mongoose.model('Deck', deckSchema);
