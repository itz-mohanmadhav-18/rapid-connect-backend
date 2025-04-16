const express = require('express');
const { check } = require('express-validator');
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation
} = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all donations and create new donation
router.route('/')
  .get(getDonations)
  .post(
    [
      check('resources', 'Resources are required').isArray({ min: 1 }),
      check('resources.*.name', 'Resource name is required').not().isEmpty(),
      check('resources.*.quantity', 'Resource quantity is required').isNumeric(),
      check('resources.*.unit', 'Resource unit is required').not().isEmpty(),
      check('baseCamp', 'Base camp ID is required').not().isEmpty(),
      check('scheduledDate', 'Scheduled delivery date is required').not().isEmpty()
    ],
    createDonation
  );

// Get, update and delete donation by ID
router.route('/:id')
  .get(getDonationById)
  .put(updateDonation)
  .delete(deleteDonation);

module.exports = router;