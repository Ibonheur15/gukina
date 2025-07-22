import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Hockey', 'General'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all news
        const newsRes = await axios.get(`${API_URL}/news`);
        setNews(newsRes.data);
        
        // Fetch featured news
        const featuredRes = await axios.get(`${API_URL}/news/featured`);
        setFeaturedNews(featuredRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  const handleCategoryChange = async (category) => {
    try {
      setLoading(true);
      setActiveCategory(category);
      
      if (category === 'All') {
        const res = await axios.get(`${API_URL}/news`);
        setNews(res.data);
      } else {
        const res = await axios.get(`${API_URL}/news/category/${category}`);
        setNews(res.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching news by category:', err);
      setError('Failed to load news');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Latest News</h1>
      
      {/* Featured News */}
      {featuredNews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNews.map((item) => (
              <div key={item._id} className="bg-dark-200 rounded-lg overflow-hidden">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <span className="text-xs text-primary">{item.category}</span>
                  <h3 className="text-lg font-semibold mt-1 mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {item.content.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>By {item.author?.name || 'Admin'}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <Link 
                    to={`/news/${item._id}`} 
                    className="mt-3 inline-block text-primary hover:underline"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Category Filter */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
              activeCategory === category ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
            }`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* News List */}
      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item._id} className="bg-dark-200 rounded-lg overflow-hidden">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <span className="text-xs text-primary">{item.category}</span>
                <h3 className="text-lg font-semibold mt-1 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-3">
                  {item.content.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>By {item.author?.name || 'Admin'}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <Link 
                  to={`/news/${item._id}`} 
                  className="mt-3 inline-block text-primary hover:underline"
                >
                  Read more
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-200 rounded-lg p-6 text-center">
          <p className="text-gray-400">No news articles found</p>
        </div>
      )}
    </div>
  );
};

export default NewsPage;