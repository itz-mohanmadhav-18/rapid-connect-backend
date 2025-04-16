const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a resource name'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide a quantity'],
    min: [0, 'Quantity cannot be negative'],
  },
  unit: {
    type: String,
    required: [true, 'Please provide a unit of measurement'],
  },
});

const BaseCampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the base camp'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere',
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
  },
  capacity: {
    type: Number,
    required: [true, 'Please add a capacity'],
  },
  occupancy: {
    type: Number,
    default: 0,
  },
  resources: [ResourceSchema],
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BaseCamp', BaseCampSchema);