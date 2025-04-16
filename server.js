const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Define routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/basecamps', require('./routes/baseCampRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Rapid Aid Connect API is running');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));