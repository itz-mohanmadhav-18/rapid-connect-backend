const express = require('express');
const { check } = require('express-validator');
const {
  createSOSRequest,
  getSOSRequests,
  getSOSRequestById,
  updateSOSRequest,
  deleteSOSRequest,
  getNearbySOSRequests
} = require('../controllers/sosController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all SOS requests and create new SOS request
router.route('/')
  .get(getSOSRequests)
  .post(
    [
      check('emergency', 'Emergency type is required').isIn(['Medical', 'Trapped', 'Supplies', 'Evacuation', 'Other']),
      check('description', 'Description is required').not().isEmpty(),
      check('location.coordinates', 'Location coordinates are required').isArray({ min: 2 })
    ],
    createSOSRequest
  );

// Get nearby SOS requests
router.get(
  '/radius/:longitude/:latitude/:distance',
  authorize('responder', 'volunteer'),
  getNearbySOSRequests
);

// Get, update and delete SOS request by ID
router.route('/:id')
  .get(getSOSRequestById)
  .put(updateSOSRequest)
  .delete(deleteSOSRequest);

module.exports = router;