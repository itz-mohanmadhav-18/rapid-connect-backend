const express = require('express');
const { check } = require('express-validator');
const {
  createBaseCamp,
  getBaseCamps,
  getBaseCampById,
  updateBaseCamp,
  deleteBaseCamp,
  updateResources,
  assignVolunteer,
  removeVolunteer,
  getNearbyBaseCamps
} = require('../controllers/baseCampController');
const { getBaseCampDonations } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all base camps and create new base camp
router.route('/')
  .get(getBaseCamps)
  .post(
    authorize('responder'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('capacity', 'Capacity is required').isNumeric()
    ],
    createBaseCamp
  );

// Get nearby base camps
router.get(
  '/radius/:longitude/:latitude/:distance',
  getNearbyBaseCamps
);

// Get base camp by ID, update and delete
router.route('/:id')
  .get(getBaseCampById)
  .put(authorize('responder'), updateBaseCamp)
  .delete(authorize('responder'), deleteBaseCamp);

// Update resources of a base camp
router.put(
  '/:id/resources',
  authorize('responder', 'volunteer'),
  updateResources
);

// Assign a volunteer to a base camp
router.put(
  '/:id/volunteers',
  authorize('responder'),
  assignVolunteer
);

// Remove a volunteer from a base camp
router.delete(
  '/:id/volunteers/:volunteerId',
  authorize('responder'),
  removeVolunteer
);

// Get all donations for a base camp
router.get('/:id/donations', getBaseCampDonations);

module.exports = router;