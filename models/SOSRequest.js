const mongoose = require('mongoose');

const SOSRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  emergency: {
    type: String,
    required: [true, 'Please specify the type of emergency'],
    enum: ['Medical', 'Trapped', 'Supplies', 'Evacuation', 'Other'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the emergency'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please provide coordinates (longitude, latitude)'],
      index: '2dsphere',
    },
    address: String,
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'resolved'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('SOSRequest', SOSRequestSchema);