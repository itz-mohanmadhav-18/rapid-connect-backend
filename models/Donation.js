const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resources: [{
    name: {
      type: String,
      required: [true, 'Please provide a resource name'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit of measurement'],
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