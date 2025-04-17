// Simple script to verify Nodemailer credentials
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Checking Nodemailer/Gmail credentials:');
console.log('-----------------------------------');

// Check if credentials are set
const email = process.env.ALERT_EMAIL;
const password = process.env.ALERT_EMAIL_PASS;

if (!email || !password) {
  console.error('❌ Error: ALERT_EMAIL or ALERT_EMAIL_PASS is missing in your .env file');
  process.exit(1);
}

console.log('ALERT_EMAIL:', email ? '✅ Set' : '❌ Not set');
console.log('ALERT_EMAIL_PASS:', password ? '✅ Set' : '❌ Not set');

// Check if email is Gmail
const isGmail = email.endsWith('@gmail.com');
console.log('Using Gmail account:', isGmail ? '✅ Yes' : '❌ No (might need different configuration)');

if (isGmail) {
  console.log('\nImportant note for Gmail:');
  console.log('- Gmail requires an "App Password" for nodemailer');
  console.log('- Regular Gmail passwords will not work');
  console.log('- You need to enable 2-Step Verification, then create an App Password');
  console.log('- Visit: https://myaccount.google.com/security');
}

// Create transporter and test connection
console.log('\nTesting SMTP connection...');
const transportConfig = isGmail ? {
  service: 'gmail',
  auth: {
    user: email,
    pass: password
  }
} : {
  host: 'smtp.gmail.com', // Fallback to direct SMTP config
  port: 587,
  secure: false,
  auth: {
    user: email,
    pass: password
  }
};

const transporter = nodemailer.createTransport(transportConfig);

// Verify connection
transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection successful!');
    console.log('\nTesting by sending a test email...');
    
    // Try to send a test email
    return transporter.sendMail({
      from: `"Test System" <${email}>`,
      to: email, // Send to self for testing
      subject: 'Test Email from Rapid Aid Connect',
      text: 'This is a test email to verify SMTP functionality.'
    });
  })
  .then(info => {
    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
  })
  .catch(error => {
    console.error('❌ SMTP verification failed:', error.message);
    
    if (isGmail && error.message.includes('Invalid login')) {
      console.log('\nFor Gmail accounts, you need an App Password:');
      console.log('1. Go to https://myaccount.google.com/security');
      console.log('2. Enable 2-Step Verification if not already enabled');
      console.log('3. Scroll down to "App passwords"');
      console.log('4. Create a new app password for "Mail"');
      console.log('5. Copy the 16-character password and update your .env file');
    } else {
      console.log('\nTroubleshooting steps:');
      console.log('1. Check if your email and password are correct');
      console.log('2. For Gmail, ensure you are using an App Password');
      console.log('3. Check if your email provider allows SMTP access');
      console.log('4. Verify that your account has not been locked for security reasons');
    }
  });