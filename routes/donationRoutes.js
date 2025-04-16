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
      check('donationType', 'Donation type is required').optional().isIn(['resource', 'cash']),
      // Conditionally validate based on donation type
      check('resources').custom((resources, { req }) => {
        if (req.body.donationType === 'cash') {
          return true; // Skip resources validation for cash donations
        }
        if (!Array.isArray(resources) || resources.length === 0) {
          throw new Error('Resources are required for resource donations');
        }
        return true;
      }),
      check('resources.*.name', 'Resource name is required').optional().not().isEmpty(),
      check('resources.*.quantity', 'Resource quantity is required').optional().isNumeric(),
      check('resources.*.unit', 'Resource unit is required').optional().not().isEmpty(),
      // Cash donation validation
      check('amount').custom((amount, { req }) => {
        if (req.body.donationType === 'cash' && (!amount || isNaN(amount) || amount <= 0)) {
          throw new Error('Valid amount is required for cash donations');
        }
        return true;
      }),
      check('paymentId').custom((paymentId, { req }) => {
        if (req.body.donationType === 'cash' && !paymentId) {
          throw new Error('Payment ID is required for cash donations');
        }
        return true;
      }),
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