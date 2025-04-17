const { validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const User = require('../models/User');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Load environment variables directly to validate if they're properly set
console.log('TWILIO_SID:', process.env.TWILIO_SID ? 'Set (first 4 chars: ' + process.env.TWILIO_SID.substring(0, 4) + ')' : 'Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set (length: ' + process.env.TWILIO_AUTH_TOKEN.length + ')' : 'Not set');
console.log('TWILIO_PHONE:', process.env.TWILIO_PHONE ? 'Set: ' + process.env.TWILIO_PHONE : 'Not set');
console.log('ALERT_EMAIL:', process.env.ALERT_EMAIL ? 'Set: ' + process.env.ALERT_EMAIL : 'Not set');
console.log('ALERT_EMAIL_PASS:', process.env.ALERT_EMAIL_PASS ? 'Set (length: ' + process.env.ALERT_EMAIL_PASS.length + ')' : 'Not set');

// Create Twilio client with error handling and validation
let twilioClient;
try {
  twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  // Validate Twilio credentials by attempting to fetch account info
  twilioClient.api.accounts(process.env.TWILIO_SID).fetch()
    .then(account => {
      console.log(`Twilio account status: ${account.status}`);
      console.log('Twilio credentials are valid!');
    })
    .catch(err => {
      console.error('⚠️ Twilio credentials validation failed:', err.message);
      console.error('Please check your TWILIO_SID and TWILIO_AUTH_TOKEN in the .env file');
      twilioClient = null; // Invalidate the client if credentials aren't working
    });
} catch (error) {
  console.error('Failed to initialize Twilio client:', error.message);
}

// Create NodeMailer transporter with error handling
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_EMAIL_PASS
    }
  });
} catch (error) {
  console.error('Failed to initialize email transporter:', error.message);
}

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

    // Make sure createdBy is set from the authenticated user
    if (!req.user || !req.user.id) {
      console.error('User authentication issue - req.user:', req.user);
      
      // Try to get a default responder from the database as a fallback
      try {
        const defaultResponder = await User.findOne({ role: 'responder' });
        if (defaultResponder) {
          req.body.createdBy = defaultResponder._id;
          console.log(`Using default responder ID: ${defaultResponder._id}`);
        } else {
          return res.status(401).json({
            success: false,
            message: 'User not authenticated properly and no fallback found'
          });
        }
      } catch (userErr) {
        console.error('Error finding fallback user:', userErr);
        return res.status(401).json({
          success: false,
          message: 'User not authenticated properly'
        });
      }
    } else {
      // Add user ID to request body
      req.body.createdBy = req.user.id;
    }
    
    // Set defaults for required fields if not provided
    if (!req.body.affectedUsers) {
      req.body.affectedUsers = 0;
    }
    
    // Ensure all required fields are present
    const requiredFields = ['title', 'description', 'area', 'severity'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Ensure the location field is properly formatted if it exists
    if (req.body.location) {
      // Make sure it has the correct format for MongoDB geospatial queries
      if (!req.body.location.type) {
        req.body.location.type = 'Point';
      }
      
      // Make sure coordinates are valid (if they exist)
      if (req.body.location.coordinates && 
          (!Array.isArray(req.body.location.coordinates) || 
           req.body.location.coordinates.length !== 2 ||
           typeof req.body.location.coordinates[0] !== 'number' ||
           typeof req.body.location.coordinates[1] !== 'number')) {
        // Default to Delhi coordinates if invalid
        req.body.location.coordinates = [77.1025, 28.7041];
      }
    } else {
      // Set default location if none provided
      req.body.location = {
        type: 'Point',
        coordinates: [77.1025, 28.7041], // Default Delhi coordinates
        address: req.body.area || 'Delhi, India'
      };
    }
    
    console.log('Creating alert with data:', JSON.stringify(req.body, null, 2));
    
    // Create a new Alert instance and validate it before saving
    const newAlert = new Alert(req.body);
    
    // Explicitly validate the alert before saving
    try {
      await newAlert.validate();
    } catch (validationError) {
      console.error('Alert validation failed:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Alert validation failed',
        errors: validationError.errors
      });
    }
    
    // Save the alert to the database
    const alert = await newAlert.save();
    console.log('Alert created successfully:', alert._id);

    // SMS notification logic (no change)
    const messageText = `🚨 Alert: ${alert.title || 'Disaster'} in ${alert.area || 'your area'}.`;
    const notificationResults = {
      sms: { success: 0, failed: 0, errors: [] },
      email: { success: 0, failed: 0, errors: [] }
    };

    // Loop through all recipients (no change)
    for (const recipient of recipients) {
      // Send SMS if Twilio client was initialized successfully
      if (twilioClient) {
        try {
          console.log(`Attempting to send SMS to ${recipient.phone}...`);
          const smsResult = await twilioClient.messages.create({
            body: messageText,
            from: process.env.TWILIO_PHONE,
            to: recipient.phone
          });
          console.log(`SMS sent successfully to ${recipient.phone}, SID: ${smsResult.sid}`);
          notificationResults.sms.success++;
        } catch (smsError) {
          console.error(`Failed to send SMS to ${recipient.phone}:`, smsError.message);
          notificationResults.sms.failed++;
          notificationResults.sms.errors.push({
            recipient: recipient.phone,
            error: smsError.message,
            code: smsError.code
          });
        }
      } else {
        console.error('Skipping SMS sending: Twilio client not initialized');
        notificationResults.sms.failed++;
      }

      // Send Email if transporter was initialized successfully
      if (transporter) {
        try {
          console.log(`Attempting to send email to ${recipient.email}...`);
          const emailResult = await transporter.sendMail({
            from: `"Disaster Alert System" <${process.env.ALERT_EMAIL}>`,
            to: recipient.email,
            subject: '🚨 Emergency Alert Notification',
            text: messageText
          });
          console.log(`Email sent successfully to ${recipient.email}`);
          notificationResults.email.success++;
        } catch (emailError) {
          console.error(`Failed to send email to ${recipient.email}:`, emailError.message);
          notificationResults.email.failed++;
          notificationResults.email.errors.push({
            recipient: recipient.email,
            error: emailError.message
          });
        }
      } else {
        console.error('Skipping email sending: Email transporter not initialized');
        notificationResults.email.failed++;
      }
    }

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alert created and notifications sent.',
      notificationResults
    });
  } catch (err) {
    console.error('Error in createAlert:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: err.message
    });
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

// @desc    Test Twilio and Email functionality
// @route   GET /api/alerts/test-notifications
// @access  Private (Responders only)
exports.testNotifications = async (req, res, next) => {
  const results = {
    twilio: { success: false, message: '', error: null },
    email: { success: false, message: '', error: null }
  };

  // Test Twilio
  try {
    if (!twilioClient) {
      results.twilio.message = 'Twilio client not initialized';
      results.twilio.error = 'Check if TWILIO_SID and TWILIO_AUTH_TOKEN are correctly set';
    } else if (!process.env.TWILIO_PHONE) {
      results.twilio.message = 'Twilio phone number not set';
      results.twilio.error = 'TWILIO_PHONE environment variable is missing';
    } else {
      // Test sending SMS
      const testSms = await twilioClient.messages.create({
        body: 'This is a test message from Rapid Aid Connect',
        from: process.env.TWILIO_PHONE,
        to: recipients[0].phone // Send to first recipient
      });
      
      results.twilio.success = true;
      results.twilio.message = `SMS sent successfully! SID: ${testSms.sid}`;
    }
  } catch (error) {
    results.twilio.error = error.message;
    
    // Check for specific Twilio errors
    if (error.code === 20003) {
      results.twilio.message = 'Authentication error. Check your Twilio credentials.';
    } else if (error.code === 21211) {
      results.twilio.message = 'This number is not a valid/verified recipient for your trial account.';
    } else if (error.code === 21608) {
      results.twilio.message = 'The "from" phone number is not valid.';
    } else {
      results.twilio.message = 'Failed to send SMS';
    }
  }

  // Test Email
  try {
    if (!transporter) {
      results.email.message = 'Email transporter not initialized';
      results.email.error = 'Check if ALERT_EMAIL and ALERT_EMAIL_PASS are correctly set';
    } else {
      // First verify the connection
      await transporter.verify();
      
      // Test sending email
      const testEmail = await transporter.sendMail({
        from: `"Disaster Alert System Test" <${process.env.ALERT_EMAIL}>`,
        to: recipients[0].email, // Send to first recipient
        subject: 'Test Email from Rapid Aid Connect',
        text: 'This is a test email to verify that the notification system is working correctly.'
      });
      
      results.email.success = true;
      results.email.message = 'Email sent successfully!';
    }
  } catch (error) {
    results.email.error = error.message;
    
    // Check for common email errors
    if (error.message.includes('Invalid login')) {
      results.email.message = 'Invalid email login. Check your email and password.';
    } else if (error.message.includes('authentication failed')) {
      results.email.message = 'Authentication failed. For Gmail, you might need an app-specific password.';
    } else {
      results.email.message = 'Failed to send email';
    }
  }

  res.status(200).json({
    success: true,
    data: results,
    message: 'Test completed'
  });
};