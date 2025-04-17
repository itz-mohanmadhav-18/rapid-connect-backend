// test-twilio.js
require('dotenv').config();
const twilio = require('twilio');

console.log('== TWILIO CREDENTIALS TEST ==');
console.log('TWILIO_SID:', process.env.TWILIO_SID ? `✓ Set (${process.env.TWILIO_SID.substring(0, 8)}...)` : '✗ Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? `✓ Set (${process.env.TWILIO_AUTH_TOKEN.length} chars)` : '✗ Not set');
console.log('TWILIO_PHONE:', process.env.TWILIO_PHONE ? `✓ Set (${process.env.TWILIO_PHONE})` : '✗ Not set');
console.log('=============================');

// Function to test Twilio credentials and send a test message
async function testTwilioSetup() {
  try {
    // Step 1: Create a Twilio client (this will validate if SID and Auth Token formats are correct)
    console.log('\n🔶 Step 1: Creating Twilio client...');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client created successfully (SID and Auth Token formats are valid)');
    
    // Step 2: Validate credentials by fetching account info
    console.log('\n🔶 Step 2: Validating credentials by fetching account info...');
    try {
      const account = await client.api.accounts(process.env.TWILIO_SID).fetch();
      console.log(`✅ Account validation successful`);
      console.log(`  - Account Status: ${account.status}`);
      console.log(`  - Account Type: ${account.type}`);
      console.log(`  - Account Friendly Name: ${account.friendlyName}`);
    } catch (error) {
      console.error('❌ Account validation failed:', error.message);
      console.error('Please check your TWILIO_SID and TWILIO_AUTH_TOKEN in the .env file');
      return;
    }
    
    // Step 3: Check phone number validation
    console.log('\n🔶 Step 3: Checking your Twilio phone number...');
    try {
      // List all phone numbers in your account
      const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({limit: 20});
      
      if (incomingPhoneNumbers.length === 0) {
        console.error('❌ No phone numbers found in your Twilio account.');
        return;
      }
      
      console.log(`✅ Found ${incomingPhoneNumbers.length} phone number(s) in your account:`);
      
      const configuredPhone = process.env.TWILIO_PHONE;
      let phoneNumberMatch = false;
      
      incomingPhoneNumbers.forEach((number, index) => {
        console.log(`  ${index + 1}. ${number.phoneNumber} (${number.friendlyName})`);
        if (number.phoneNumber === configuredPhone) {
          phoneNumberMatch = true;
          console.log(`     ✅ This matches your configured TWILIO_PHONE`);
        }
      });
      
      if (!phoneNumberMatch) {
        console.error(`❌ Your configured phone number (${configuredPhone}) does not match any number in your account.`);
        console.error('   You should update your TWILIO_PHONE in the .env file to one of the numbers listed above.');
      }
    } catch (error) {
      console.error('❌ Failed to fetch phone numbers:', error.message);
      return;
    }
    
    // Step 4: Check Trial Account Limitations
    console.log('\n🔶 Step 4: Checking for Trial Account limitations...');
    try {
      const account = await client.api.accounts(process.env.TWILIO_SID).fetch();
      
      if (account.type === 'Trial') {
        console.log('⚠️ You are using a Trial Account. Trial accounts have the following limitations:');
        console.log('   - Can only send SMS to verified phone numbers');
        console.log('   - Have a trial account message prefix in every SMS');
        console.log('   - Have limited credits');
        
        // Check for verified numbers
        console.log('\n   Checking for verified phone numbers...');
        try {
          const verifiedNumbers = await client.validationRequests.list();
          
          if (verifiedNumbers.length === 0) {
            console.log('   ⚠️ No verified phone numbers found for your trial account.');
            console.log('   You need to verify recipient phone numbers before you can send SMS to them.');
            console.log('   Go to https://www.twilio.com/console/phone-numbers/verified to verify phone numbers.');
          } else {
            console.log(`   ✅ Found ${verifiedNumbers.length} verified phone number(s):`);
            verifiedNumbers.forEach((number, index) => {
              console.log(`     ${index + 1}. ${number.phoneNumber}`);
            });
          }
        } catch (error) {
          console.error('   ❌ Failed to check verified numbers:', error.message);
        }
      } else {
        console.log('✅ You are using a full Twilio account. No trial limitations apply.');
      }
    } catch (error) {
      console.error('❌ Failed to check account type:', error.message);
    }
    
    // Step 5: Send a test message to the first recipient
    console.log('\n🔶 Step 5: Sending a test SMS...');
    
    // Get the first recipient's phone number from your application
    const recipients = [
      { name: 'harsh gupta', phone: '+918006620327' },
      { name: 'mohan madhav', phone: '+917668445818' }
    ];
    
    const testRecipient = recipients[0].phone;
    
    try {
      const message = await client.messages.create({
        body: 'This is a test message from Rapid Aid Connect (Diagnostic Tool)',
        from: process.env.TWILIO_PHONE,
        to: testRecipient
      });
      
      console.log(`✅ Test message sent successfully!`);
      console.log(`   SID: ${message.sid}`);
      console.log(`   Status: ${message.status}`);
      console.log(`   Recipient: ${testRecipient}`);
    } catch (error) {
      console.error('❌ Failed to send test message:', error.message);
      
      // Provide more helpful messages for common errors
      if (error.code === 21211) {
        console.error('   This is likely because the recipient number is not verified in your trial account.');
        console.error('   Go to https://www.twilio.com/console/phone-numbers/verified to verify the recipient number.');
      } else if (error.code === 21608) {
        console.error('   The "from" phone number is not valid or does not belong to your account.');
        console.error('   Make sure your TWILIO_PHONE in .env matches a number in your Twilio account.');
      } else if (error.code === 20003) {
        console.error('   Authentication failed. Double-check your Account SID and Auth Token.');
      }
    }
    
  } catch (error) {
    console.error('Failed to test Twilio setup:', error.message);
  }
}

// Run the test
testTwilioSetup().then(() => {
  console.log('\n== Test Completed ==');
}).catch(err => {
  console.error('Error running test:', err);
});