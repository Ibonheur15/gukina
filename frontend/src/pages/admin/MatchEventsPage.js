import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MatchEventsPage = () => {
  const { matchId } = useParams();
  const { token } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: 'goal',
    minute: '',
    team: '',
    player: '',
    additionalInfo: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  useEffect(() => {
    fetchMatch();
  }, [matchId, token]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/matches/${matchId}`, config);
      setMatch(response.data);
      
      // Set default team to home team if available
      if (response.data && response.data.homeTeam) {
        setFormData(prev => ({
          ...prev,
          team: response.data.homeTeam._id
        }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Failed to load match data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'minute' ? parseInt(value, 10) || '' : value
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
        await axios.put(`${API_URL}/matches/${matchId}/events/${currentEventId}`, formData, config);
      } else {
        await axios.post(`${API_URL}/matches/${matchId}/events`, formData, config);
      }
      
      // Reset form except team
      setFormData({
        type: 'goal',
        minute: '',
        team: formData.team,
        player: '',
        additionalInfo: ''
      });
      setEditMode(false);
      setCurrentEventId(null);
      
      // Refresh match data
      fetchMatch();
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setFormData({
      type: event.type,
      minute: event.minute,
      team: event.team._id || event.team,
      player: event.player,
      additionalInfo: event.additionalInfo || ''
    });
    setEditMode(true);
    setCurrentEventId(event._id);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        await axios.delete(`${API_URL}/matches/${matchId}/events/${eventId}`, config);
        fetchMatch();
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event');
      }
    }
  };

  const cancelEdit = () => {
    setFormData({
      type: 'goal',
      minute: '',
      team: match ? match.homeTeam._id : '',
      player: '',
      additionalInfo: ''
    });
    setEditMode(false);
    setCurrentEventId(null);
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'goal': return 'Goal';
      case 'yellow_card': return 'Yellow Card';
      case 'red_card': return 'Red Card';
      case 'substitution': return 'Substitution';
      case 'penalty': return 'Penalty';
      default: return type;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'goal':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      case 'yellow_card':
        return <div className="h-5 w-3 bg-yellow-400"></div>;
      case 'red_card':
        return <div className="h-5 w-3 bg-red-600"></div>;
      case 'substitution':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'penalty':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
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

  if (!match) {
    return (
      <div className="bg-dark-200 rounded-lg p-6 text-center">
        <p className="text-gray-400">Match not found</p>
        <Link to="/admin/matches" className="text-primary hover:underline mt-4 inline-block">
          Back to Matches
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Match Events</h1>
        <Link 
          to="/admin/matches" 
          className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-400"
        >
          Back to Matches
        </Link>
      </div>
      
      {/* Match Info */}
      <div className="bg-dark-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex flex-col items-center mr-4">
              <div className="w-12 h-12 bg-dark-300 rounded-full flex items-center justify-center overflow-hidden mb-1">
                {match.homeTeam.logo ? (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold">{match.homeTeam.shortName}</span>
                )}
              </div>
              <span className="text-sm">{match.homeTeam.name}</span>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {match.homeScore} - {match.awayScore}
              </div>
              <div className="text-sm text-gray-400">
                {match.status === 'live' ? (
                  <span className="text-red-500">{match.currentMinute || 0}'</span>
                ) : (
                  format(parseISO(match.matchDate), 'MMM d, yyyy h:mm a')
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center ml-4">
              <div className="w-12 h-12 bg-dark-300 rounded-full flex items-center justify-center overflow-hidden mb-1">
                {match.awayTeam.logo ? (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold">{match.awayTeam.shortName}</span>
                )}
              </div>
              <span className="text-sm">{match.awayTeam.name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold">{match.league.name}</div>
            <div className="text-xs text-gray-400">{match.venue}</div>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Event Form */}
      <div className="bg-dark-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Event' : 'Add Event'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="goal">Goal</option>
                <option value="yellow_card">Yellow Card</option>
                <option value="red_card">Red Card</option>
                <option value="substitution">Substitution</option>
                <option value="penalty">Penalty</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Minute</label>
              <input
                type="number"
                name="minute"
                value={formData.minute}
                onChange={handleChange}
                min="1"
                max="120"
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team</label>
              <select
                name="team"
                value={formData.team}
                onChange={handleChange}
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Team</option>
                <option value={match.homeTeam._id}>{match.homeTeam.name}</option>
                <option value={match.awayTeam._id}>{match.awayTeam.name}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Player</label>
              <input
                type="text"
                name="player"
                value={formData.player}
                onChange={handleChange}
                placeholder="Player Name"
                className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Additional Info</label>
            <input
              type="text"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="e.g. Assisted by Player Name, Substituted Player Name"
              className="w-full bg-dark-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {editMode ? 'Update' : 'Add'} Event
            </button>
            
            {editMode && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Events List */}
      <div className="bg-dark-200 rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Match Events</h2>
        
        {match.events && match.events.length > 0 ? (
          <div className="px-6 pb-6">
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-dark-300"></div>
              
              {/* Events */}
              {[...match.events]
                .sort((a, b) => b.minute - a.minute) // Sort by minute descending (most recent first)
                .map((event, index) => {
                  const isHomeTeam = event.team._id === match.homeTeam._id || event.team === match.homeTeam._id;
                  
                  return (
                    <div key={index} className="relative pl-8 pb-6">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-dark-300 flex items-center justify-center">
                        {getEventIcon(event.type)}
                      </div>
                      
                      {/* Event content */}
                      <div className={`flex items-start ${isHomeTeam ? 'justify-start' : 'justify-end'}`}>
                        <div className="bg-dark-300 rounded-lg p-3 max-w-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">
                              {isHomeTeam ? match.homeTeam.name : match.awayTeam.name}
                            </span>
                            <span className="text-sm text-gray-400">{event.minute}'</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">{getEventTypeLabel(event.type)}:</span>
                            <span className="font-medium">{event.player}</span>
                          </div>
                          {event.additionalInfo && (
                            <div className="text-sm text-gray-400 mt-1">
                              {event.additionalInfo}
                            </div>
                          )}
                          <div className="flex space-x-3 mt-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="text-xs text-blue-500 hover:text-blue-400"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="text-xs text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No events recorded for this match yet
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchEventsPage;