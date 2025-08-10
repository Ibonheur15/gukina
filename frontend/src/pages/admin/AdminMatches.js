import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminMatches = () => {
  const { token } = useAuth();
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { confirm, modalProps } = useConfirmation();
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    league: '',
    matchDate: '',
    matchTime: '',
    venue: '',
    status: 'not_started',
    homeScore: 0,
    awayScore: 0,
    season: new Date().getFullYear().toString(),
    round: ''
  });
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [minuteTimers, setMinuteTimers] = useState({});

  useEffect(() => {
    fetchData();
    generateAvailableSeasons();
    
    // Cleanup function for timers
    return () => {
      // Clean up all timers when component unmounts
      Object.keys(minuteTimers).forEach(matchId => {
        clearInterval(minuteTimers[matchId]);
      });
    };
  }, [token]);
  
  // Generate available seasons (current year and 5 years back)
  const generateAvailableSeasons = () => {
    const currentYear = new Date().getFullYear();
    const seasons = [];
    
    // Add current year and 5 years back
    for (let i = 0; i <= 5; i++) {
      seasons.push((currentYear - i).toString());
    }
    
    setAvailableSeasons(seasons);
  };

  // Setup timers for any live matches when matches data changes
  useEffect(() => {
    // Find all live matches and start timers for them
    matches.forEach(match => {
      if (match.status === 'live' && !minuteTimers[match._id]) {
        startMinuteTimer(match._id, match.currentMinute || 1);
      }
    });
  }, [matches]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Fetch matches
      const matchesRes = await axios.get(`${API_URL}/matches`, config);
      setMatches(matchesRes.data);
      
      // Fetch leagues for dropdown
      const leaguesRes = await axios.get(`${API_URL}/leagues`, config);
      setLeagues(leaguesRes.data);
      
      // Fetch teams for dropdown
      const teamsRes = await axios.get(`${API_URL}/teams`, config);
      setTeams(teamsRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear any previous errors
    setError(null);
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      // Check if selecting the same team for home and away
      if (name === 'homeTeam' && value === formData.awayTeam && value !== '') {
        setError('Home team and away team cannot be the same');
      } else if (name === 'awayTeam' && value === formData.homeTeam && value !== '') {
        setError('Home team and away team cannot be the same');
      }
      
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if home team and away team are the same
    if (formData.homeTeam === formData.awayTeam) {
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
      
      // Combine date and time for matchDate
      const dateTime = new Date(`${formData.matchDate}T${formData.matchTime}`);
      
      const matchData = {
        ...formData,
        matchDate: dateTime.toISOString(),
      };
      
      // Remove matchTime as it's not in the model
      delete matchData.matchTime;
      
      if (editMode) {
        await axios.put(`${API_URL}/matches/${currentId}`, matchData, config);
      } else {
        await axios.post(`${API_URL}/matches`, matchData, config);
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving match:', err);
      setError(err.response?.data?.message || 'Failed to save match');
    }
  };

  const handleEdit = (match) => {
    const matchDate = new Date(match.matchDate);
    
    setFormData({
      homeTeam: match.homeTeam?._id || '',
      awayTeam: match.awayTeam?._id || '',
      league: match.league?._id || '',
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
      title: 'Delete Match',
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
          fetchData();
        } catch (err) {
          console.error('Error deleting match:', err);
          setError('Failed to delete match');
        }
      }
    });
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/matches/${id}/status`, { status }, config);
      
      // Start or stop minute timer based on status
      if (status === 'live') {
        startMinuteTimer(id, response.data.currentMinute || 1);
      } else {
        stopMinuteTimer(id);
      }
      
      fetchData();
    } catch (err) {
      console.error('Error updating match status:', err);
      setError('Failed to update match status');
    }
  };
  
  const startMinuteTimer = (matchId, startMinute) => {
    // Clear any existing timer for this match
    stopMinuteTimer(matchId);
    
    // Create a new timer that increments the minute every 60 seconds
    const timer = setInterval(async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        };
        
        // Get current match data
        const matchResponse = await axios.get(`${API_URL}/matches/${matchId}`, config);
        const match = matchResponse.data;
        
        // Only update if match is still live
        if (match.status === 'live') {
          const nextMinute = match.currentMinute + 1;
          await axios.put(`${API_URL}/matches/${matchId}/minute`, { currentMinute: nextMinute }, config);
          
          // Update local state without full refetch
          setMatches(prevMatches => 
            prevMatches.map(m => 
              m._id === matchId ? { ...m, currentMinute: nextMinute } : m
            )
          );
        } else {
          // If match is no longer live, stop the timer
          stopMinuteTimer(matchId);
        }
      } catch (err) {
        console.error('Error updating match minute:', err);
        stopMinuteTimer(matchId);
      }
    }, 60000); // Update every 60 seconds
    
    // Store the timer reference
    setMinuteTimers(prev => ({ ...prev, [matchId]: timer }));
  };
  
  const stopMinuteTimer = (matchId) => {
    if (minuteTimers[matchId]) {
      clearInterval(minuteTimers[matchId]);
      setMinuteTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[matchId];
        return newTimers;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      homeTeam: '',
      awayTeam: '',
      league: '',
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
      <h1 className="text-2xl font-bold mb-6">Manage Matches</h1>
      
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Match Form */}
      <div className="bg-dark-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Match' : 'Add Match'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">League</label>
              <select
                name="league"
                value={formData.league}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select League</option>
                {leagues.map((league) => (
                  <option key={league._id} value={league._id}>
                    {league.name}
                  </option>
                ))}
              </select>
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
                <option value="">Select Season</option>
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
              <label className="block text-sm font-medium mb-1">Home Team</label>
              <select
                name="homeTeam"
                value={formData.homeTeam}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Home Team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Away Team</label>
              <select
                name="awayTeam"
                value={formData.awayTeam}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Away Team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
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
                placeholder="e.g. Matchday 5"
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
              {editMode ? 'Update' : 'Add'} Match
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
        <h2 className="text-xl font-semibold p-6">Matches</h2>
        
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
                    <div className="flex items-center">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          {match.homeTeam?.logo ? (
                            <img 
                              src={match.homeTeam.logo} 
                              alt={match.homeTeam.name} 
                              className="w-5 h-5 mr-2 object-contain"
                            />
                          ) : (
                            <span className="w-5 h-5 mr-2 bg-dark-400 rounded-full flex items-center justify-center text-xs">
                              {match.homeTeam?.shortName?.substring(0, 1) || 'H'}
                            </span>
                          )}
                          <span>{match.homeTeam?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          {match.awayTeam?.logo ? (
                            <img 
                              src={match.awayTeam.logo} 
                              alt={match.awayTeam.name} 
                              className="w-5 h-5 mr-2 object-contain"
                            />
                          ) : (
                            <span className="w-5 h-5 mr-2 bg-dark-400 rounded-full flex items-center justify-center text-xs">
                              {match.awayTeam?.shortName?.substring(0, 1) || 'A'}
                            </span>
                          )}
                          <span>{match.awayTeam?.name || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {match.league?.name || 'N/A'}
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
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(match)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          Edit
                        </button>
                        <Link
                          to={`/admin/matches/${match._id}/events`}
                          className="text-green-500 hover:text-green-400"
                        >
                          Events
                        </Link>
                        <button
                          onClick={() => handleDelete(match._id, match.homeTeam?.name || 'Unknown', match.awayTeam?.name || 'Unknown')}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        {match.status === 'not_started' && (
                          <button
                            onClick={() => handleStatusUpdate(match._id, 'live')}
                            className="text-xs flex items-center"
                            title="Start Match"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 hover:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {match.status === 'live' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(match._id, 'halftime')}
                              className="text-xs flex items-center"
                              title="Half Time"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 hover:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <span className="text-xs text-gray-400">{match.currentMinute || 0}'</span>
                          </>
                        )}
                        {match.status === 'halftime' && (
                          <button
                            onClick={() => handleStatusUpdate(match._id, 'live')}
                            className="text-xs flex items-center"
                            title="Resume Match"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 hover:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        {(match.status === 'live' || match.status === 'halftime') && (
                          <button
                            onClick={() => handleStatusUpdate(match._id, 'ended')}
                            className="text-xs flex items-center"
                            title="End Match"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 hover:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              
              {matches.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    No matches found
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

export default AdminMatches;