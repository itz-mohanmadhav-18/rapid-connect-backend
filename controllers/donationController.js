const { validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const BaseCamp = require('../models/BaseCamp');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (All roles)
exports.createDonation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add donor (user) to request body
    req.body.donor = req.user.id;

    const donation = await Donation.create(req.body);

    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private
exports.getDonations = async (req, res, next) => {
  try {
    let query;
    
    // For donors, show only their donations
    // For responders and volunteers, show all donations
    if (req.user.role === 'donor') {
      query = Donation.find({ donor: req.user.id });
    } else {
      query = Donation.find();
    }

    // Add filtering by status if provided
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Add filtering by base camp if provided
    if (req.query.baseCamp) {
      query = query.find({ baseCamp: req.query.baseCamp });
    }

    const donations = await query
      .populate({
        path: 'donor',
        select: 'name'
      })
      .populate({
        path: 'baseCamp',
        select: 'name location'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private
exports.getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate({
        path: 'donor',
        select: 'name email'
      })
      .populate({
        path: 'baseCamp',
        select: 'name location'
      });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check if user is the donor or is a responder/volunteer
    if (
      donation.donor._id.toString() !== req.user.id &&
      req.user.role === 'donor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this donation'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id
// @access  Private
exports.updateDonation = async (req, res, next) => {
  try {
    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Only allow donor to update if status is pending
    // Responders and volunteers can update any status
    if (
      req.user.role === 'donor' &&
      donation.donor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    // If status is being changed to delivered, update delivered date
    if (req.body.status === 'delivered' && donation.status !== 'delivered') {
      req.body.deliveredDate = Date.now();
      
      // Update base camp resources when donation is delivered
      if (donation.status !== 'delivered') {
        const baseCamp = await BaseCamp.findById(donation.baseCamp);
        
        if (baseCamp) {
          // Add donated resources to base camp inventory
          for (const donatedResource of donation.resources) {
            const existingResourceIndex = baseCamp.resources.findIndex(
              resource => resource.name === donatedResource.name
            );
            
            if (existingResourceIndex !== -1) {
              // Update existing resource
              baseCamp.resources[existingResourceIndex].quantity += donatedResource.quantity;
            } else {
              // Add new resource
              baseCamp.resources.push({
                name: donatedResource.name,
                quantity: donatedResource.quantity,
                unit: donatedResource.unit
              });
            }
          }
          
          await baseCamp.save();
        }
      }
    }

    donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private
exports.deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Only donor can delete their own donation and only if status is pending
    if (
      donation.donor.toString() !== req.user.id ||
      donation.status !== 'pending'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this donation'
      });
    }

    await donation.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get donations for a specific base camp
// @route   GET /api/basecamps/:id/donations
// @access  Private
exports.getBaseCampDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ baseCamp: req.params.id })
      .populate({
        path: 'donor',
        select: 'name'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (err) {
    next(err);
  }
};