require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/News');
const User = require('./models/User');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gukina', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed news articles
const seedNews = async () => {
  try {
    console.log('=== SEEDING NEWS ARTICLES ===\n');
    
    // Check if news articles exist
    const newsCount = await News.countDocuments();
    console.log(`Found ${newsCount} existing news articles`);
    
    if (newsCount > 0) {
      console.log('News articles already exist. Skipping seeding.');
      process.exit(0);
    }
    
    // Find an admin user to use as author
    let author = await User.findOne({ isAdmin: true });
    
    if (!author) {
      // Create an admin user if none exists
      console.log('No admin user found. Creating one...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      author = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      await author.save();
      console.log('Created admin user');
    }
    
    // Sample news articles
    const newsArticles = [
      {
        title: 'Team A Wins Championship in Thrilling Final',
        content: `<p>In a thrilling match that kept fans on the edge of their seats, Team A emerged victorious in the championship final, defeating Team B with a score of 3-2.</p>
        <p>The match was a display of exceptional skill and determination from both sides, but Team A's strategic gameplay and teamwork ultimately secured their victory.</p>
        <p>The winning goal came in the final minutes of the game, sending fans into a frenzy of celebration. This marks Team A's third championship title in the last five years.</p>`,
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        category: 'Football',
        author: author._id,
        featured: true,
        active: true
      },
      {
        title: 'New Stadium to Be Built for Local Team',
        content: `<p>Exciting news for sports fans in the region as plans for a new state-of-the-art stadium have been approved for the local team.</p>
        <p>The stadium, which will have a capacity of 45,000, is expected to be completed within the next two years and will feature modern amenities and improved accessibility for fans.</p>
        <p>This development is part of a larger initiative to enhance sports infrastructure in the region and is expected to boost the local economy.</p>`,
        image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        category: 'General',
        author: author._id,
        featured: false,
        active: true
      },
      {
        title: 'Rising Star Signs with Major Team',
        content: `<p>The sports world is buzzing with excitement as rising star player has signed a contract with one of the major teams in the league.</p>
        <p>The young athlete, who has been making waves with their exceptional performance in recent seasons, is expected to bring fresh energy and talent to the team.</p>
        <p>Fans are eagerly anticipating the upcoming season to see how this new addition will impact the team's performance.</p>`,
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1493&q=80',
        category: 'Football',
        author: author._id,
        featured: true,
        active: true
      },
      {
        title: 'Basketball Tournament to Feature International Teams',
        content: `<p>An exciting basketball tournament is set to take place next month, featuring teams from various countries around the world.</p>
        <p>The tournament will showcase top talent and provide a platform for international competition and cultural exchange through sports.</p>
        <p>Organizers are expecting a large turnout and have arranged for the games to be broadcast live for fans who cannot attend in person.</p>`,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1490&q=80',
        category: 'Basketball',
        author: author._id,
        featured: false,
        active: true
      },
      {
        title: 'New Training Program Launched for Young Athletes',
        content: `<p>A new comprehensive training program has been launched to nurture young athletic talent in the region.</p>
        <p>The program, which is designed to identify and develop potential in young athletes, will provide professional coaching, facilities, and support to help them reach their full potential.</p>
        <p>This initiative is part of a broader effort to invest in the future of sports and create opportunities for the next generation of athletes.</p>`,
        image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1429&q=80',
        category: 'General',
        author: author._id,
        featured: false,
        active: true
      }
    ];
    
    // Insert news articles
    await News.insertMany(newsArticles);
    console.log(`Created ${newsArticles.length} news articles`);
    
    console.log('\n=== NEWS SEEDING COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding news:', error);
    process.exit(1);
  }
};

// Run the seeding
seedNews();