const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a memory'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the memory'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for the memory'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please specify the memory date'],
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    mood: {
      type: String,
      default: '😊 Happy',
      trim: true,
    },
    tags: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    images: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'memories',
  }
);

// Compound and specialized indexes for query performance
memorySchema.index({ userId: 1, date: -1 });
memorySchema.index({ userId: 1, isFavorite: 1 });
memorySchema.index({ userId: 1, tags: 1 });
memorySchema.index({ userId: 1, mood: 1 });
memorySchema.index(
  { title: 'text', description: 'text', location: 'text' },
  { weights: { title: 3, description: 1, location: 2 }, name: 'MemoryTextSearchIndex' }
);

module.exports = mongoose.model('Memory', memorySchema);
