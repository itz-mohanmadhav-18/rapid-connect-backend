// Simple debugging script to monitor alert creation
const express = require('express');
const router = express.Router();
const Alert = require('./models/Alert');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.post('/debug-alert', async (req, res) => {
  try {
    console.log('Received alert creation request with data:', req.body);
    
    // Check if we have a valid MongoDB ObjectId for createdBy
    if (!req.body.createdBy || !mongoose.Types.ObjectId.isValid(req.body.createdBy)) {
      console.log('Invalid or missing createdBy field:', req.body.createdBy);
      
      // Try to get a valid user ID from the database as a fallback
      const sampleUser = await mongoose.connection.db.collection('users').findOne({ role: 'responder' });
      if (sampleUser) {
        console.log('Found a fallback responder user:', sampleUser._id);
        req.body.createdBy = sampleUser._id;
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'No valid user ID provided and no fallback found' 
        });
      }
    }
    
    // Ensure all required fields are present
    const requiredFields = ['title', 'description', 'area', 'severity'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate the data
    const alert = new Alert(req.body);
    await alert.validate();
    
    console.log('Alert validation succeeded');
    res.status(200).json({
      success: true,
      message: 'Alert data is valid and would be created successfully'
    });
  } catch (err) {
    console.error('Error in debug-alert:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = app;