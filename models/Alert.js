const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the alert'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the alert'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  area: {
    type: String,
    required: [true, 'Please specify the affected area']
  },
  severity: {
    type: String,
    required: [true, 'Please specify the severity level'],
    enum: ['critical', 'high', 'medium', 'low']
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'draft'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  affectedUsers: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String
  }
});

module.exports = mongoose.model('Alert', AlertSchema);