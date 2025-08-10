import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminStandaloneMatches = () => {
  const { token } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { confirm, modalProps } = useConfirmation();
  const [formData, setFormData] = useState({
    homeTeamName: '',
    awayTeamName: '',
    leagueName: '',
    matchDate: '',
    matchTime: '',
    venue: '',
    status: 'not_started',
    homeScore: 0,
    awayScore: 0,
    season: new Date().getFullYear().toString(),
    round: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchStandaloneMatches();
  }, [token]);

  const fetchStandaloneMatches = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const res = await axios.get(`${API_URL}/matches`, config);
      const standaloneMatches = res.data.filter(match => match.isStandalone);
      setMatches(standaloneMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching standalone matches:', err);
      setError('Failed to load standalone matches');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setError(null);
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.homeTeamName.trim() === formData.awayTeamName.trim() && formData.homeTeamName.trim() !== '') {
      setError('Home team and away team cannot be the same');
      return;
    }
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      const dateTime = new Date(`${formData.matchDate}T${formData.matchTime}`);
      
      const matchData = {
        matchDate: dateTime.toISOString(),
        venue: formData.venue,
        status: formData.status,
        homeScore: formData.homeScore,
        awayScore: formData.awayScore,
        season: formData.season,
        round: formData.round,
        isStandalone: true,
        standaloneData: {
          homeTeamName: formData.homeTeamName,
          awayTeamName: formData.awayTeamName,
          leagueName: formData.leagueName
        }
      };
      
      if (editMode) {
        await axios.put(`${API_URL}/matches/${currentId}`, matchData, config);
      } else {
        await axios.post(`${API_URL}/matches`, matchData, config);
      }
      
      resetForm();
      fetchStandaloneMatches();
    } catch (err) {
      console.error('Error saving standalone match:', err);
      setError(err.response?.data?.message || 'Failed to save standalone match');
    }
  };

  const handleEdit = (match) => {
    const matchDate = new Date(match.matchDate);
    
    setFormData({
      homeTeamName: match.standaloneData?.homeTeamName || '',
      awayTeamName: match.standaloneData?.awayTeamName || '',
      leagueName: match.standaloneData?.leagueName || '',
      matchDate: format(matchDate, 'yyyy-MM-dd'),
      matchTime: format(matchDate, 'HH:mm'),
      venue: match.venue,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      season: match.season,
      round: match.round || ''
    });
    
    setEditMode(true);
    setCurrentId(match._id);
  };

  const handleDelete = async (id, homeTeam, awayTeam) => {
    confirm({
      title: 'Delete Standalone Match',
      message: `Are you sure you want to delete the match between ${homeTeam} and ${awayTeam}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          await axios.delete(`${API_URL}/matches/${id}`, config);
          fetchStandaloneMatches();
        } catch (err) {
          console.error('Error deleting standalone match:', err);
          setError('Failed to delete standalone match');
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      homeTeamName: '',
      awayTeamName: '',
      leagueName: '',
      matchDate: '',
      matchTime: '',
      venue: '',
      status: 'not_started',
      homeScore: 0,
      awayScore: 0,
      season: new Date().getFullYear().toString(),
      round: ''
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <span className="px-2 py-1 bg-red-900 bg-opacity-30 text-red-500 text-xs rounded">Live</span>;
      case 'halftime':
        return <span className="px-2 py-1 bg-orange-900 bg-opacity-30 text-orange-500 text-xs rounded">Half Time</span>;
      case 'ended':
        return <span className="px-2 py-1 bg-green-900 bg-opacity-30 text-green-500 text-xs rounded">Ended</span>;
      case 'postponed':
        return <span className="px-2 py-1 bg-yellow-900 bg-opacity-30 text-yellow-500 text-xs rounded">Postponed</span>;
      case 'canceled':
        return <span className="px-2 py-1 bg-red-900 bg-opacity-30 text-red-500 text-xs rounded">Canceled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">Not Started</span>;
    }
  };

  const formatMatchDate = (dateString) => {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  };

  if (loading && matches.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <ConfirmationModal {...modalProps} />
      <h1 className="text-2xl font-bold mb-6">Manage Standalone Matches</h1>
      <p className="text-gray-400 mb-6">Create and manage special matches not part of regular league competitions</p>
      
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Match Form */}
      <div className="bg-dark-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Standalone Match' : 'Add Standalone Match'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">League Name</label>
              <input
                type="text"
                name="leagueName"
                value={formData.leagueName}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter league name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Season</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Home Team Name</label>
              <input
                type="text"
                name="homeTeamName"
                value={formData.homeTeamName}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter home team name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Away Team Name</label>
              <input
                type="text"
                name="awayTeamName"
                value={formData.awayTeamName}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter away team name"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="matchDate"
                value={formData.matchDate}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                name="matchTime"
                value={formData.matchTime}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Round</label>
              <input
                type="text"
                name="round"
                value={formData.round}
                onChange={handleChange}
                placeholder="e.g. Friendly, Exhibition"
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="not_started">Not Started</option>
                <option value="live">Live</option>
                <option value="halftime">Half Time</option>
                <option value="ended">Ended</option>
                <option value="postponed">Postponed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Home Score</label>
              <input
                type="number"
                name="homeScore"
                value={formData.homeScore}
                onChange={handleChange}
                min="0"
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Away Score</label>
              <input
                type="number"
                name="awayScore"
                value={formData.awayScore}
                onChange={handleChange}
                min="0"
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {editMode ? 'Update' : 'Add'} Standalone Match
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
      
      {/* Matches List */}
      <div className="bg-dark-200 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Standalone Matches</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-300">
              <tr>
                <th className="text-left p-4">Match</th>
                <th className="text-left p-4">League</th>
                <th className="text-left p-4">Season</th>
                <th className="text-left p-4">Date & Time</th>
                <th className="text-left p-4">Venue</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Score</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match._id} className="border-t border-dark-300">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-purple-900 bg-opacity-30 text-purple-400 text-xs rounded mr-2">SM</span>
                        <span>{match.standaloneData?.homeTeamName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="px-2 py-1 bg-purple-900 bg-opacity-30 text-purple-400 text-xs rounded mr-2">SM</span>
                        <span>{match.standaloneData?.awayTeamName || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {match.standaloneData?.leagueName || 'N/A'}
                  </td>
                  <td className="p-4">
                    {match.season ? `${match.season}/${(parseInt(match.season) + 1).toString().slice(-2)}` : 'N/A'}
                  </td>
                  <td className="p-4">
                    {formatMatchDate(match.matchDate)}
                  </td>
                  <td className="p-4">
                    {match.venue}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(match.status)}
                  </td>
                  <td className="p-4">
                    {match.homeScore} - {match.awayScore}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(match)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(match._id, match.standaloneData?.homeTeamName, match.standaloneData?.awayTeamName)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {matches.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    No standalone matches found
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

export default AdminStandaloneMatches;