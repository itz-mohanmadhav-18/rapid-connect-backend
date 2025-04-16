const { validationResult } = require('express-validator');
const SOSRequest = require('../models/SOSRequest');

// @desc    Create a new SOS request
// @route   POST /api/sos
// @access  Private
exports.createSOSRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user to request body
    req.body.user = req.user.id;

    const sosRequest = await SOSRequest.create(req.body);

    res.status(201).json({
      success: true,
      data: sosRequest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all SOS requests
// @route   GET /api/sos
// @access  Private (Responders and Volunteers)
exports.getSOSRequests = async (req, res, next) => {
  try {
    // For responders and volunteers, show all SOS requests
    // For regular users, only show their own requests
    let query;
    
    if (req.user.role === 'donor') {
      query = SOSRequest.find({ user: req.user.id });
    } else {
      query = SOSRequest.find();
    }

    // Add filtering by status if provided
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    
    // Get SOS requests and populate with user details
    const sosRequests = await query
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'assignedTo',
        select: 'name'
      });

    res.status(200).json({
      success: true,
      count: sosRequests.length,
      data: sosRequests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get SOS request by ID
// @route   GET /api/sos/:id
// @access  Private
exports.getSOSRequestById = async (req, res, next) => {
  try {
    const sosRequest = await SOSRequest.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name'
      })
      .populate({
        path: 'assignedTo',
        select: 'name'
      });

    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    // Check if user owns the SOS request or is a responder/volunteer
    if (
      sosRequest.user._id.toString() !== req.user.id &&
      req.user.role === 'donor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this SOS request'
      });
    }

    res.status(200).json({
      success: true,
      data: sosRequest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update SOS request
// @route   PUT /api/sos/:id
// @access  Private
exports.updateSOSRequest = async (req, res, next) => {
  try {
    let sosRequest = await SOSRequest.findById(req.params.id);

    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    // Check if user owns the SOS request or is a responder
    if (
      sosRequest.user.toString() !== req.user.id &&
      req.user.role !== 'responder'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this SOS request'
      });
    }

    // Only responders can update status to assigned and set assignedTo
    if (req.body.status === 'assigned' && req.user.role === 'responder') {
      req.body.assignedTo = req.user.id;
    }

    // If status is changed to resolved, set resolvedAt timestamp
    if (req.body.status === 'resolved' && sosRequest.status !== 'resolved') {
      req.body.resolvedAt = Date.now();
    }

    sosRequest = await SOSRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: sosRequest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete SOS request
// @route   DELETE /api/sos/:id
// @access  Private
exports.deleteSOSRequest = async (req, res, next) => {
  try {
    const sosRequest = await SOSRequest.findById(req.params.id);

    if (!sosRequest) {
      return res.status(404).json({
        success: false,
        message: 'SOS request not found'
      });
    }

    // Check if user owns the SOS request or is an admin
    if (
      sosRequest.user.toString() !== req.user.id &&
      req.user.role !== 'responder'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this SOS request'
      });
    }

    await sosRequest.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get nearby SOS requests within radius
// @route   GET /api/sos/radius/:zipcode/:distance
// @access  Private (Responders only)
exports.getNearbySOSRequests = async (req, res, next) => {
  try {
    const { longitude, latitude, distance } = req.params;

    // Calculate radius using radians
    // Earth radius is 3,963 miles / 6,378 km
    const radius = distance / 3963;

    const sosRequests = await SOSRequest.find({
      location: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
      },
      status: 'pending'
    }).populate({
      path: 'user',
      select: 'name'
    });

    res.status(200).json({
      success: true,
      count: sosRequests.length,
      data: sosRequests
    });
  } catch (err) {
    next(err);
  }
};