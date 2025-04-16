const { validationResult } = require('express-validator');
const BaseCamp = require('../models/BaseCamp');

// @desc    Create a new base camp
// @route   POST /api/basecamps
// @access  Private (Responders only)
exports.createBaseCamp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const baseCamp = await BaseCamp.create(req.body);

    res.status(201).json({
      success: true,
      data: baseCamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all base camps
// @route   GET /api/basecamps
// @access  Private
exports.getBaseCamps = async (req, res, next) => {
  try {
    const baseCamps = await BaseCamp.find();

    res.status(200).json({
      success: true,
      count: baseCamps.length,
      data: baseCamps
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get base camp by ID
// @route   GET /api/basecamps/:id
// @access  Private
exports.getBaseCampById = async (req, res, next) => {
  try {
    const baseCamp = await BaseCamp.findById(req.params.id).populate('volunteers');

    if (!baseCamp) {
      return res.status(404).json({
        success: false,
        message: 'Base camp not found'
      });
    }

    res.status(200).json({
      success: true,
      data: baseCamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update base camp
// @route   PUT /api/basecamps/:id
// @access  Private (Responders only)
exports.updateBaseCamp = async (req, res, next) => {
  try {
    let baseCamp = await BaseCamp.findById(req.params.id);

    if (!baseCamp) {
      return res.status(404).json({
        success: false,
        message: 'Base camp not found'
      });
    }

    baseCamp = await BaseCamp.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: baseCamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete base camp
// @route   DELETE /api/basecamps/:id
// @access  Private (Responders only)
exports.deleteBaseCamp = async (req, res, next) => {
  try {
    const baseCamp = await BaseCamp.findById(req.params.id);

    if (!baseCamp) {
      return res.status(404).json({
        success: false,
        message: 'Base camp not found'
      });
    }

    await baseCamp.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resources in a base camp
// @route   PUT /api/basecamps/:id/resources
// @access  Private (Responders and Volunteers)
exports.updateResources = async (req, res, next) => {
  try {
    const { resources } = req.body;
    
    if (!resources || !Array.isArray(resources)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resources array'
      });
    }

    const baseCamp = await BaseCamp.findById(req.params.id);

    if (!baseCamp) {
      return res.status(404).json({
        success: false,
        message: 'Base camp not found'
      });
    }

    // Update each resource in the base camp
    for (const updatedResource of resources) {
      const resourceIndex = baseCamp.resources.findIndex(
        resource => resource._id.toString() === updatedResource.id
      );

      if (resourceIndex !== -1) {
        // Update existing resource
        baseCamp.resources[resourceIndex].quantity = updatedResource.quantity;
      } else {
        // Add new resource
        baseCamp.resources.push({
          name: updatedResource.name,
          quantity: updatedResource.quantity,
          unit: updatedResource.unit
        });
      }
    }

    await baseCamp.save();

    res.status(200).json({
      success: true,
      data: baseCamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign volunteer to base camp
// @route   PUT /api/basecamps/:id/volunteers
// @access  Private (Responders only)
exports.assignVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    
    if (!volunteerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide volunteer ID'
      });
    }

    const baseCamp = await BaseCamp.findById(req.params.id);

    if (!baseCamp) {
      return res.status(404).json({
        success: false,
        message: 'Base camp not found'
      });
    }

    // Check if volunteer is already assigned
    if (baseCamp.volunteers.includes(volunteerId)) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer already assigned to this base camp'
      });
    }

    // Add volunteer to base camp
    baseCamp.volunteers.push(volunteerId);
    await baseCamp.save();

    res.status(200).json({
      success: true,
      data: baseCamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove volunteer from base camp
// @route   DELETE /api/basecamps/:id/volunteers/:volunteerId
// @access  Private (Responders only)
exports.removeVolunteer = async (req, res, next) => {
  try {
    const baseCamp = await BaseCamp.findById(req.params.id);

    if (!baseCamp) {
      return res.status(404).json({
        success: false,
        message: 'Base camp not found'
      });
    }

    // Remove volunteer from base camp
    baseCamp.volunteers = baseCamp.volunteers.filter(
      volunteer => volunteer.toString() !== req.params.volunteerId
    );
    
    await baseCamp.save();

    res.status(200).json({
      success: true,
      data: baseCamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get nearby base camps within radius
// @route   GET /api/basecamps/radius/:longitude/:latitude/:distance
// @access  Private
exports.getNearbyBaseCamps = async (req, res, next) => {
  try {
    const { longitude, latitude, distance } = req.params;

    // Calculate radius using radians
    // Earth radius is 3,963 miles / 6,378 km
    const radius = distance / 3963;

    const baseCamps = await BaseCamp.find({
      location: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
      }
    });

    res.status(200).json({
      success: true,
      count: baseCamps.length,
      data: baseCamps
    });
  } catch (err) {
    next(err);
  }
};