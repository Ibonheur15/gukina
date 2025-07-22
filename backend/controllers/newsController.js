const News = require('../models/News');

// Get all news
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find({ active: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured news
exports.getFeaturedNews = async (req, res) => {
  try {
    const news = await News.find({ featured: true, active: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get news by category
exports.getNewsByCategory = async (req, res) => {
  try {
    const news = await News.find({ 
      category: req.params.category,
      active: true 
    })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get news by ID
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'name');
    
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create news
exports.createNews = async (req, res) => {
  try {
    const newNews = new News({
      ...req.body,
      author: req.user.id // From auth middleware
    });
    
    const savedNews = await newNews.save();
    const populatedNews = await News.findById(savedNews._id)
      .populate('author', 'name');
    
    res.status(201).json(populatedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update news
exports.updateNews = async (req, res) => {
  try {
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name');
    
    if (!updatedNews) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.status(200).json(updatedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete news
exports.deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    
    if (!deletedNews) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    res.status(200).json({ message: 'News article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};