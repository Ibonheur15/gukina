import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminLeagues = () => {
  const { token } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    season: new Date().getFullYear().toString(),
    logo: '',
    active: true,
    priority: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Fetch leagues
      const leaguesRes = await axios.get(`${API_URL}/leagues`, config);
      setLeagues(leaguesRes.data);
      
      // Fetch countries for dropdown
      const countriesRes = await axios.get(`${API_URL}/countries`, config);
      setCountries(countriesRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
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
        await axios.put(`${API_URL}/leagues/${currentId}`, formData, config);
      } else {
        await axios.post(`${API_URL}/leagues`, formData, config);
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving league:', err);
      setError(err.response?.data?.message || 'Failed to save league');
    }
  };

  const handleEdit = (league) => {
    setFormData({
      name: league.name,
      country: league.country._id,
      season: league.season,
      logo: league.logo || '',
      active: league.active,
      priority: league.priority || 0
    });
    setEditMode(true);
    setCurrentId(league._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this league?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        await axios.delete(`${API_URL}/leagues/${id}`, config);
        fetchData();
      } catch (err) {
        console.error('Error deleting league:', err);
        setError('Failed to delete league');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      season: new Date().getFullYear().toString(),
      logo: '',
      active: true,
      priority: 0
    });
    setEditMode(false);
    setCurrentId(null);
  };

  if (loading && leagues.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Competitions</h1>
      
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* League Form */}
      <div className="bg-dark-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Competition' : 'Add Competition'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Season</label>
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Season</option>
              {/* Generate options for current year and 5 years back */}
              {Array.from({ length: 6 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year.toString()}>
                    {year}/{(year + 1).toString().slice(-2)}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active
            </label>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Priority (higher numbers appear first)</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {editMode ? 'Update' : 'Add'} Competition
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
      
      {/* Leagues List */}
      <div className="bg-dark-200 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Competitions</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Country</th>
                <th className="text-left p-4">Season</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Priority</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leagues.map((league) => (
                <tr key={league._id} className="border-t border-dark-300">
                  <td className="p-4">
                    <div className="flex items-center">
                      {league.logo ? (
                        <img 
                          src={league.logo} 
                          alt={league.name} 
                          className="w-8 h-8 mr-3 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 mr-3 bg-dark-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">{league.name.substring(0, 2)}</span>
                        </div>
                      )}
                      {league.name}
                    </div>
                  </td>
                  <td className="p-4">
                    {league.country?.name || 'Unknown'}
                  </td>
                  <td className="p-4">{league.season}</td>
                  <td className="p-4">
                    {league.active ? (
                      <span className="px-2 py-1 bg-green-900 bg-opacity-30 text-green-500 text-xs rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">{league.priority || 0}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(league)}
                      className="text-blue-500 hover:text-blue-400 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(league._id)}
                      className="text-red-500 hover:text-red-400 mr-3"
                    >
                      Delete
                    </button>
                    <a
                      href={`/admin/leagues/${league._id}/standings`}
                      className="text-primary hover:text-primary-dark"
                    >
                      Standings
                    </a>
                  </td>
                </tr>
              ))}
              
              {leagues.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No competitions found
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

export default AdminLeagues;