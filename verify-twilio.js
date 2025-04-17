// Simple script to verify Twilio credentials
require('dotenv').config();
const twilio = require('twilio');

console.log('Checking Twilio credentials:');
console.log('--------------------------');

// Check formatting of credentials
const sid = process.env.TWILIO_SID;
const auth = process.env.TWILIO_AUTH_TOKEN;

if (!sid || !auth) {
  console.error('❌ Error: TWILIO_SID or TWILIO_AUTH_TOKEN is missing in your .env file');
  process.exit(1);
}

console.log('TWILIO_SID starts with "AC":', sid.startsWith('AC') ? '✅ Correct' : '❌ Incorrect');
console.log('TWILIO_AUTH_TOKEN length is 32:', auth.length === 32 ? '✅ Correct' : '❌ Incorrect');

// Test authentication
console.log('\nTesting authentication with Twilio...');
const client = twilio(sid, auth);

client.api.accounts(sid).fetch()
  .then(account => {
    console.log('✅ Authentication successful!');
    console.log(`Account status: ${account.status}`);
    console.log(`Account type: ${account.type}`);
  })
  .catch(error => {
    console.error('❌ Authentication failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Verify that your Auth Token is correct. Retrieve it from your Twilio Console:');
    console.log('   https://console.twilio.com/');
    console.log('2. Check if your Twilio account is active and not suspended');
    console.log('3. Make sure your account has not been locked due to security concerns');
  });