// Simple script to test if environment variables are loading correctly
console.log('\n--- Environment Variables Check ---');
console.log('TWILIO_SID:', process.env.TWILIO_SID ? `Set (${process.env.TWILIO_SID.substring(0, 4)}...)` : 'Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? `Set (${process.env.TWILIO_AUTH_TOKEN.length} chars)` : 'Not set');
console.log('TWILIO_PHONE:', process.env.TWILIO_PHONE ? `Set (${process.env.TWILIO_PHONE})` : 'Not set');
console.log('ALERT_EMAIL:', process.env.ALERT_EMAIL ? `Set (${process.env.ALERT_EMAIL})` : 'Not set');
console.log('ALERT_EMAIL_PASS:', process.env.ALERT_EMAIL_PASS ? `Set (${process.env.ALERT_EMAIL_PASS.length} chars)` : 'Not set');
console.log('-----------------------------------\n');

// Testing Twilio client initialization
try {
  const twilio = require('twilio');
  const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('Twilio client initialized successfully!');
  
  // Test if we can fetch account info
  twilioClient.api.accounts(process.env.TWILIO_SID).fetch()
    .then(account => {
      console.log(`Twilio account status: ${account.status}`);
      console.log('Twilio credentials are valid!');
    })
    .catch(err => {
      console.error('Twilio account check failed:', err.message);
    });
} catch (error) {
  console.error('Failed to initialize Twilio client:', error.message);
}

// Testing Nodemailer setup
try {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_EMAIL_PASS
    }
  });
  
  console.log('Nodemailer transporter created successfully!');
  
  // Verify connection configuration
  transporter.verify()
    .then(() => {
      console.log('Nodemailer credentials are valid!');
    })
    .catch(err => {
      console.error('Nodemailer verification failed:', err.message);
    });
} catch (error) {
  console.error('Failed to create Nodemailer transporter:', error.message);
}