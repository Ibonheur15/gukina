import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SingleNewsPage = () => {
  const { newsId } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/news/${newsId}`);
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news article');
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsId]);

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
        <Link to="/news" className="block mt-4 text-center underline">
          Back to News
        </Link>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="bg-dark-200 rounded-lg p-6 text-center">
        <p className="text-gray-400">News article not found</p>
        <Link to="/news" className="block mt-4 text-primary underline">
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <Link to="/news" className="flex items-center text-gray-400 hover:text-primary mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to News
      </Link>
      
      {/* Category badge */}
      <div className="mb-2">
        <span className="bg-primary bg-opacity-20 text-primary text-xs px-2 py-1 rounded">
          {news.category}
        </span>
      </div>
      
      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
      
      {/* Meta info */}
      <div className="flex items-center text-sm text-gray-400 mb-6">
        <span>By {news.author?.name || 'Admin'}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(news.createdAt)}</span>
      </div>
      
      {/* Featured image */}
      {news.image && (
        <div className="mb-6">
          <img 
            src={news.image} 
            alt={news.title} 
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
      
      {/* Content */}
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />
    </div>
  );
};

export default SingleNewsPage;