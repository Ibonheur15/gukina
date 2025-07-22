import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminTeams = () => {
  const { token } = useAuth();
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    country: '',
    leagues: [],
    logo: '',
    city: '',
    stadium: '',
    foundedYear: '',
    active: true
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
      
      // Fetch teams
      const teamsRes = await axios.get(`${API_URL}/teams`, config);
      setTeams(teamsRes.data);
      
      // Fetch countries for dropdown
      const countriesRes = await axios.get(`${API_URL}/countries`, config);
      setCountries(countriesRes.data);
      
      // Fetch leagues for dropdown
      const leaguesRes = await axios.get(`${API_URL}/leagues`, config);
      setLeagues(leaguesRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'leagues') {
      // Handle multi-select for leagues
      const options = e.target.options;
      const selectedLeagues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedLeagues.push(options[i].value);
        }
      }
      setFormData({
        ...formData,
        leagues: selectedLeagues
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
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
        await axios.put(`${API_URL}/teams/${currentId}`, formData, config);
      } else {
        await axios.post(`${API_URL}/teams`, formData, config);
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving team:', err);
      setError(err.response?.data?.message || 'Failed to save team');
    }
  };

  const handleEdit = (team) => {
    setFormData({
      name: team.name,
      shortName: team.shortName,
      country: team.country._id,
      leagues: team.leagues.map(league => league._id),
      logo: team.logo || '',
      city: team.city || '',
      stadium: team.stadium || '',
      foundedYear: team.foundedYear || '',
      active: team.active
    });
    setEditMode(true);
    setCurrentId(team._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        await axios.delete(`${API_URL}/teams/${id}`, config);
        fetchData();
      } catch (err) {
        console.error('Error deleting team:', err);
        setError('Failed to delete team');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      country: '',
      leagues: [],
      logo: '',
      city: '',
      stadium: '',
      foundedYear: '',
      active: true
    });
    setEditMode(false);
    setCurrentId(null);
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Teams</h1>
      
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Team Form */}
      <div className="bg-dark-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Team' : 'Add Team'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Short Name</label>
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                placeholder="3-4 letters (e.g. ARS)"
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
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
            
            <div>
              <label className="block text-sm font-medium mb-1">Leagues</label>
              <select
                name="leagues"
                value={formData.leagues}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                multiple
                size="3"
              >
                {leagues
                  .filter(league => !formData.country || league.country._id === formData.country)
                  .map((league) => (
                    <option key={league._id} value={league._id}>
                      {league.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Stadium</label>
              <input
                type="text"
                name="stadium"
                value={formData.stadium}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Founded Year</label>
              <input
                type="number"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                placeholder="e.g. 1950"
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
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
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {editMode ? 'Update' : 'Add'} Team
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
      
      {/* Teams List */}
      <div className="bg-dark-200 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Teams</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300">
              <tr>
                <th className="text-left p-4">Team</th>
                <th className="text-left p-4">Country</th>
                <th className="text-left p-4">City</th>
                <th className="text-left p-4">Stadium</th>
                <th className="text-left p-4">Leagues</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team._id} className="border-t border-dark-300">
                  <td className="p-4">
                    <div className="flex items-center">
                      {team.logo ? (
                        <img 
                          src={team.logo} 
                          alt={team.name} 
                          className="w-8 h-8 mr-3 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 mr-3 bg-dark-400 rounded-full flex items-center justify-center">
                          <span className="text-xs">{team.shortName}</span>
                        </div>
                      )}
                      <div>
                        <div>{team.name}</div>
                        <div className="text-xs text-gray-400">{team.shortName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {team.country?.name || 'Unknown'}
                  </td>
                  <td className="p-4">{team.city || '-'}</td>
                  <td className="p-4">{team.stadium || '-'}</td>
                  <td className="p-4">
                    <div className="max-w-xs truncate">
                      {team.leagues?.map(l => l.name).join(', ') || '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    {team.active ? (
                      <span className="px-2 py-1 bg-green-900 bg-opacity-30 text-green-500 text-xs rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(team)}
                      className="text-blue-500 hover:text-blue-400 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {teams.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No teams found
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

export default AdminTeams;