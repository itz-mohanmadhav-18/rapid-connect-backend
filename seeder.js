const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const BaseCamp = require('./models/BaseCamp');
const SOSRequest = require('./models/SOSRequest');
const Donation = require('./models/Donation');
const { users, baseCamps, sosRequests, donations } = require('./utils/seedData');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

// Import function
const importData = async () => {
  try {
    // Clear all collections
    await User.deleteMany();
    await BaseCamp.deleteMany();
    await SOSRequest.deleteMany();
    await Donation.deleteMany();

    console.log('Data cleared...');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Get user IDs for references
    const responder = createdUsers.find(user => user.role === 'responder');
    const donor = createdUsers.find(user => user.role === 'donor');

    // Create base camps
    const baseCampsWithVolunteers = baseCamps.map(camp => ({
      ...camp,
      volunteers: [createdUsers.find(user => user.role === 'volunteer')._id]
    }));
    
    const createdBaseCamps = await BaseCamp.create(baseCampsWithVolunteers);
    console.log(`${createdBaseCamps.length} base camps created`);

    // Create SOS requests with user references
    const sosRequestsWithUser = sosRequests.map(sos => ({
      ...sos,
      user: donor._id
    }));
    
    const createdSOS = await SOSRequest.create(sosRequestsWithUser);
    console.log(`${createdSOS.length} SOS requests created`);

    // Create donations with user and base camp references
    const donationsWithRefs = donations.map(donation => ({
      ...donation,
      donor: donor._id,
      baseCamp: createdBaseCamps[0]._id
    }));
    
    const createdDonations = await Donation.create(donationsWithRefs);
    console.log(`${createdDonations.length} donations created`);

    console.log('Data imported successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete function
const deleteData = async () => {
  try {
    await User.deleteMany();
    await BaseCamp.deleteMany();
    await SOSRequest.deleteMany();
    await Donation.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Determine which function to run based on command line args
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please add proper command: -i (import) or -d (delete)');
  process.exit();
}