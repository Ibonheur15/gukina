require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./models/Country');

// Log the MongoDB URI being used (with password hidden)
const uriForLogging = process.env.MONGODB_URI.replace(
  /\/\/([^:]+):([^@]+)@/, 
  '//$1:****@'
);
console.log(`Connecting to: ${uriForLogging}`);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test data - just one country
const testCountry = {
  name: 'Test Country',
  code: 'TST',
  region: 'East Africa',
  active: true
};

async function seedTestData() {
  try {
    console.log('Starting test seed...');
    
    // Check if we can connect and access the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Create a test country
    const country = new Country(testCountry);
    await country.save();
    console.log('Test country created:', country);
    
    // Count countries to verify
    const count = await Country.countDocuments();
    console.log(`Total countries in database: ${count}`);
    
    console.log('Test seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

// Wait for connection before seeding
mongoose.connection.once('open', () => {
  console.log('MongoDB connection open, starting seed...');
  seedTestData();
});

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});