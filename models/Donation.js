const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  donationType: {
    type: String,
    enum: ['resource', 'cash'],
    default: 'resource',
  },
  amount: {
    type: Number,
    required: function() {
      return this.donationType === 'cash';
    },
  },
  paymentId: {
    type: String,
    required: function() {
      return this.donationType === 'cash';
    },
  },
  resources: [{
    name: {
      type: String,
      required: function() {
        return this.donationType !== 'cash';
      },
    },
    quantity: {
      type: Number,
      required: function() {
        return this.donationType !== 'cash';
      },
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: function() {
        return this.donationType !== 'cash';
      },
    },
  }],
  baseCamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseCamp',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please provide a scheduled delivery date'],
  },
  deliveredDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Donation', DonationSchema);