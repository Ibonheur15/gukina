require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Import routes
const countryRoutes = require('./routes/countryRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const teamRoutes = require('./routes/teamRoutes');
const matchRoutes = require('./routes/matchRoutes');
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const leagueStandingRoutes = require('./routes/leagueStandingRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const fixRoutes = require('./routes/fixRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/countries', countryRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/standings', leagueStandingRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/fix', fixRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Gukina API');
});

// Database connection test endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    // Check if connected
    if (mongoose.connection.readyState === 1) {
      // Try to get a count from a collection
      const countriesCount = await mongoose.connection.db.collection('countries').countDocuments();
      
      res.json({
        status: 'connected',
        readyState: mongoose.connection.readyState,
        dbName: mongoose.connection.name,
        collections: {
          countries: countriesCount
        }
      });
    } else {
      res.status(500).json({
        status: 'disconnected',
        readyState: mongoose.connection.readyState,
        states: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gukina', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});