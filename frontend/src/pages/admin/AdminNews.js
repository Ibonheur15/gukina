import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminNews = () => {
  const { token } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    image: '',
    featured: false
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const categories = ['Football', 'Basketball', 'Tennis', 'Cricket', 'Hockey', 'General'];

  useEffect(() => {
    fetchNews();
  }, [token]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const res = await axios.get(`${API_URL}/news`, config);
      setNews(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      if (editMode) {
        await axios.put(`${API_URL}/news/${currentId}`, formData, config);
      } else {
        await axios.post(`${API_URL}/news`, formData, config);
      }
      
      resetForm();
      fetchNews();
    } catch (err) {
      console.error('Error saving news:', err);
      setError(err.response?.data?.message || 'Failed to save news');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      image: item.image || '',
      featured: item.featured
    });
    setEditMode(true);
    setCurrentId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        await axios.delete(`${API_URL}/news/${id}`, config);
        fetchNews();
      } catch (err) {
        console.error('Error deleting news:', err);
        setError('Failed to delete news');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'General',
      image: '',
      featured: false
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && news.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage News</h1>
      
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* News Form */}
      <div className="bg-dark-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit News Article' : 'Add News Article'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="featured" className="text-sm font-medium">
              Featured Article
            </label>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {editMode ? 'Update' : 'Add'} News
            </button>
            
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* News List */}
      <div className="bg-dark-200 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">News Articles</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Featured</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item._id} className="border-t border-dark-300">
                  <td className="p-4">{item.title}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{formatDate(item.createdAt)}</td>
                  <td className="p-4">
                    {item.featured ? (
                      <span className="text-primary">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:text-blue-400 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {news.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No news articles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNews;