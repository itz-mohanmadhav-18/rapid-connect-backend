const { validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASS
  }
});

const recipients = [
  {
    name: 'harsh gupta',
    email: 'h8551283@gmail.com',
    phone: '+918006620327'
  },
  {
    name: 'mohan madhav',
    email: 'mohanmadhav448@gmail.com',
    phone: '+917668445818'
  }

];

exports.createAlert = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    req.body.createdBy = req.user.id;
    const alert = await Alert.create(req.body);

    const messageText = `🚨 Alert: ${alert.type || 'Disaster'} in ${alert.area || 'your area'}.`;

    // Loop through all recipients
    for (const recipient of recipients) {
      // Send SMS
      await twilioClient.messages.create({
        body: messageText,
        from: process.env.TWILIO_PHONE,
        to: recipient.phone
      });

      // Send Email
      await transporter.sendMail({
        from: `"Disaster Alert System" <${process.env.ALERT_EMAIL}>`,
        to: recipient.email,
        subject: '🚨 Emergency Alert Notification',
        text: messageText
      });
    }

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alert created and notifications sent.'
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res, next) => {
  try {
    let query = Alert.find()
      .populate({
        path: 'createdBy',
        select: 'name role'
      });

    // Add filtering by status if provided
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Add filtering by severity if provided
    if (req.query.severity) {
      query = query.find({ severity: req.query.severity });
    }

    // Sort by created date, newest first
    query = query.sort('-createdAt');

    const alerts = await query;

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get alert by ID
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate({
        path: 'createdBy',
        select: 'name role'
      });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private (Responders only)
exports.updateAlert = async (req, res, next) => {
  try {
    let alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // If status is being changed to resolved, update resolvedAt
    if (req.body.status === 'resolved' && alert.status !== 'resolved') {
      req.body.resolvedAt = Date.now();
    }

    alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'createdBy',
      select: 'name role'
    });

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Responders only)
exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get nearby alerts within radius
// @route   GET /api/alerts/radius/:longitude/:latitude/:distance
// @access  Private
exports.getNearbyAlerts = async (req, res, next) => {
  try {
    const { longitude, latitude, distance } = req.params;

    // Calculate radius using radians
    // Earth radius is 3,963 miles / 6,378 km
    const radius = distance / 3963;

    const alerts = await Alert.find({
      location: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
      },
      status: 'active'
    }).populate({
      path: 'createdBy',
      select: 'name role'
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};