# Rapid Aid Connect Backend

This is the backend API for the Rapid Aid Connect disaster response application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and role-based access control (donors, volunteers, responders)
- SOS emergency request management
- Base camp and resource management 
- Donation tracking and fulfillment
- Geospatial queries for nearby emergency requests and base camps

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/rapid-aid-connect
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

3. Run the server:
   ```
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updateprofile` - Update user profile

### SOS Requests
- `GET /api/sos` - Get all SOS requests (filtered by role)
- `POST /api/sos` - Create a new SOS request
- `GET /api/sos/:id` - Get a specific SOS request
- `PUT /api/sos/:id` - Update a SOS request
- `DELETE /api/sos/:id` - Delete a SOS request
- `GET /api/sos/radius/:longitude/:latitude/:distance` - Get nearby SOS requests

### Base Camps
- `GET /api/basecamps` - Get all base camps
- `POST /api/basecamps` - Create a new base camp (responders only)
- `GET /api/basecamps/:id` - Get a specific base camp
- `PUT /api/basecamps/:id` - Update a base camp (responders only)
- `DELETE /api/basecamps/:id` - Delete a base camp (responders only)
- `PUT /api/basecamps/:id/resources` - Update resources in a base camp
- `PUT /api/basecamps/:id/volunteers` - Assign volunteer to a base camp
- `DELETE /api/basecamps/:id/volunteers/:volunteerId` - Remove volunteer from a base camp
- `GET /api/basecamps/radius/:longitude/:latitude/:distance` - Get nearby base camps

### Donations
- `GET /api/donations` - Get all donations (filtered by role)
- `POST /api/donations` - Create a new donation
- `GET /api/donations/:id` - Get a specific donation
- `PUT /api/donations/:id` - Update a donation status
- `DELETE /api/donations/:id` - Delete a donation (pending donations only)
- `GET /api/basecamps/:id/donations` - Get all donations for a specific base camp

## Models

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, min length 6)
- `role`: String (donor, volunteer, responder)
- `location`: GeoJSON Point

### SOSRequest
- `user`: Reference to User
- `emergency`: String (Medical, Trapped, Supplies, Evacuation, Other)
- `description`: String
- `location`: GeoJSON Point
- `status`: String (pending, assigned, resolved)
- `assignedTo`: Reference to User
- `createdAt`: Date
- `resolvedAt`: Date

### BaseCamp
- `name`: String (required, unique)
- `location`: GeoJSON Point
- `capacity`: Number
- `occupancy`: Number
- `resources`: Array of Resources
- `volunteers`: Array of References to Users

### Donation
- `donor`: Reference to User
- `resources`: Array of Resources
- `baseCamp`: Reference to BaseCamp
- `status`: String (pending, in-transit, delivered, cancelled)
- `scheduledDate`: Date
- `deliveredDate`: Date
- `createdAt`: Date
