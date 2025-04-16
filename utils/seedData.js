/**
 * Seed data for testing
 * This file contains sample data that can be used to initialize the database for testing
 */

const bcrypt = require('bcryptjs');

// Sample users
exports.users = [
  {
    name: 'John Responder',
    email: 'responder@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'responder',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041], // Delhi coordinates
      address: 'Delhi, India'
    }
  },
  {
    name: 'Sarah Volunteer',
    email: 'volunteer@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'volunteer',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139], // Delhi coordinates
      address: 'South Delhi, India'
    }
  },
  {
    name: 'Mike Donor',
    email: 'donor@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'donor',
    location: {
      type: 'Point',
      coordinates: [77.1855, 28.5245], // Gurgaon coordinates
      address: 'Gurgaon, Haryana, India'
    }
  }
];

// Sample base camps
exports.baseCamps = [
  {
    name: 'Relief Camp Alpha',
    location: {
      type: 'Point',
      coordinates: [77.1025, 28.7041],
      address: 'Delhi University North Campus, Delhi, India'
    },
    capacity: 500,
    occupancy: 320,
    resources: [
      { name: 'Water Bottles', quantity: 1200, unit: 'units' },
      { name: 'Food Packages', quantity: 850, unit: 'packs' },
      { name: 'Medical Kits', quantity: 75, unit: 'kits' },
      { name: 'Blankets', quantity: 450, unit: 'pieces' }
    ]
  },
  {
    name: 'Relief Camp Beta',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139],
      address: 'JLN Stadium, Delhi, India'
    },
    capacity: 800,
    occupancy: 650,
    resources: [
      { name: 'Water Bottles', quantity: 2000, unit: 'units' },
      { name: 'Food Packages', quantity: 1200, unit: 'packs' },
      { name: 'Medical Kits', quantity: 100, unit: 'kits' },
      { name: 'Blankets', quantity: 700, unit: 'pieces' }
    ]
  }
];

// Sample SOS requests
exports.sosRequests = [
  {
    emergency: 'Medical',
    description: 'Person with severe injury needs immediate medical attention',
    location: {
      type: 'Point',
      coordinates: [77.1075, 28.7001],
      address: 'Near Delhi University, Delhi, India'
    },
    status: 'pending'
  },
  {
    emergency: 'Trapped',
    description: 'Family trapped in partially collapsed building',
    location: {
      type: 'Point',
      coordinates: [77.2092, 28.6120],
      address: 'Lajpat Nagar, Delhi, India'
    },
    status: 'pending'
  },
  {
    emergency: 'Supplies',
    description: 'Group of 25 people need food and water',
    location: {
      type: 'Point',
      coordinates: [77.1825, 28.5265],
      address: 'DLF Cyber City, Gurgaon, India'
    },
    status: 'pending'
  }
];

// Sample donations
exports.donations = [
  {
    resources: [
      { name: 'Water Bottles', quantity: 500, unit: 'units' },
      { name: 'Food Packages', quantity: 200, unit: 'packs' }
    ],
    status: 'pending',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  },
  {
    resources: [
      { name: 'Medical Kits', quantity: 50, unit: 'kits' },
      { name: 'Blankets', quantity: 100, unit: 'pieces' }
    ],
    status: 'pending',
    scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000) // Day after tomorrow
  }
];