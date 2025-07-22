require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./models/Country');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for initialization'))
  .catch((err) => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to initialize database with test data
async function initializeDatabase() {
  try {
    // Check if countries collection is empty
    const countriesCount = await Country.countDocuments();
    
    if (countriesCount === 0) {
      console.log('No countries found. Adding test countries...');
      
      // Add test countries
      const countries = [
        {
          name: 'Rwanda',
          code: 'RW',
          flag: 'https://flagcdn.com/w320/rw.png'
        },
        {
          name: 'Kenya',
          code: 'KE',
          flag: 'https://flagcdn.com/w320/ke.png'
        },
        {
          name: 'Nigeria',
          code: 'NG',
          flag: 'https://flagcdn.com/w320/ng.png'
        }
      ];
      
      await Country.insertMany(countries);
      console.log('Test countries added successfully!');
    } else {
      console.log(`Found ${countriesCount} countries. No need to add test data.`);
    }
    
    // List all countries
    const allCountries = await Country.find();
    console.log('All countries:', allCountries);
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
}

// Run the initialization
initializeDatabase();