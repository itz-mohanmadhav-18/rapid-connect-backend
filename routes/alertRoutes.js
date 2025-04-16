const express = require('express');
const {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getNearbyAlerts
} = require('../controllers/alertController');

const router = express.Router();

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible to responders
router.use(protect);

router
  .route('/')
  .get(getAlerts)
  .post(authorize('responder'), createAlert);

router
  .route('/:id')
  .get(getAlertById)
  .put(authorize('responder'), updateAlert)
  .delete(authorize('responder'), deleteAlert);

router.route('/radius/:longitude/:latitude/:distance').get(getNearbyAlerts);

module.exports = router;