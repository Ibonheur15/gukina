require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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
const standingsRoutes = require('./routes/standingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://gukina.ukcrwanda.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Other middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Routes
app.use('/api/countries', countryRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/league-standings', leagueStandingRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/fix', fixRoutes);
app.use('/api/standings', standingsRoutes);

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
  .then(async () => {
    console.log('MongoDB connected');
    
    // Run startup scripts
    try {
      const ensureTeamsInStandings = require('./startup/ensureTeamsInStandings');
      const result = await ensureTeamsInStandings();
      console.log('Startup script completed:', result);
    } catch (error) {
      console.error('Error running startup scripts:', error);
    }
  })
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

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Global error middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});