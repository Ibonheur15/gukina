import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EventsListPage = () => {
  const { token } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, live, today, recent

  useEffect(() => {
    fetchMatches();
  }, [token]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/matches`, config);
      
      // Sort matches: live first, then today's matches, then recent matches
      const sortedMatches = response.data.sort((a, b) => {
        // Live matches first
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (a.status !== 'live' && b.status === 'live') return 1;
        
        // Then by date (most recent first)
        return new Date(b.matchDate) - new Date(a.matchDate);
      });
      
      setMatches(sortedMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches');
      setLoading(false);
    }
  };

  const getFilteredMatches = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    switch (filter) {
      case 'live':
        return matches.filter(match => 
          match.status === 'live' || match.status === 'halftime'
        );
      case 'today':
        return matches.filter(match => {
          const matchDate = new Date(match.matchDate);
          return matchDate >= today && matchDate < tomorrow;
        });
      case 'recent':
        return matches.filter(match => {
          const matchDate = new Date(match.matchDate);
          return matchDate >= weekAgo && matchDate <= today && match.status === 'ended';
        });
      default:
        return matches;
    }
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

  const formatMatchDate = (dateString) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const filteredMatches = getFilteredMatches();

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
      <h1 className="text-2xl font-bold mb-6">Match Events</h1>
      
      {/* Filters */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => setFilter('all')}
        >
          All Matches
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            filter === 'live' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => setFilter('live')}
        >
          Live Matches
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            filter === 'today' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => setFilter('today')}
        >
          Today's Matches
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            filter === 'recent' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => setFilter('recent')}
        >
          Recent Matches
        </button>
      </div>
      
      {/* Matches List */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <div key={match._id} className="bg-dark-200 rounded-lg overflow-hidden">
              {/* Match Header */}
              <div className="p-4 border-b border-dark-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">{formatMatchDate(match.matchDate)}</span>
                  {match.status === 'live' && (
                    <span className="px-2 py-1 bg-red-900 bg-opacity-30 text-red-500 text-xs rounded">
                      {match.currentMinute ? `${match.currentMinute}'` : 'LIVE'}
                    </span>
                  )}
                  {match.status === 'halftime' && (
                    <span className="px-2 py-1 bg-orange-900 bg-opacity-30 text-orange-500 text-xs rounded">
                      HT
                    </span>
                  )}
                  {match.status === 'ended' && (
                    <span className="px-2 py-1 bg-green-900 bg-opacity-30 text-green-500 text-xs rounded">
                      FT
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-dark-300 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                      {match.homeTeam.logo ? (
                        <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">{match.homeTeam.shortName}</span>
                      )}
                    </div>
                    <span className="font-medium">{match.homeTeam.name}</span>
                  </div>
                  <span className="font-bold">{match.homeScore}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-dark-300 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                      {match.awayTeam.logo ? (
                        <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">{match.awayTeam.shortName}</span>
                      )}
                    </div>
                    <span className="font-medium">{match.awayTeam.name}</span>
                  </div>
                  <span className="font-bold">{match.awayScore}</span>
                </div>
              </div>
              
              {/* Events */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Events</h3>
                  <Link 
                    to={`/admin/matches/${match._id}/events`}
                    className="text-primary text-sm hover:underline"
                  >
                    Manage Events
                  </Link>
                </div>
                
                {match.events && match.events.length > 0 ? (
                  <div className="space-y-2">
                    {match.events
                      .sort((a, b) => b.minute - a.minute) // Sort by minute descending (most recent first)
                      .slice(0, 5) // Show only the first 5 events
                      .map((event, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 text-center text-sm text-gray-400">
                            {event.minute}'
                          </div>
                          <div className="w-6 flex justify-center">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="ml-2">
                            <span className="text-sm">{event.player}</span>
                            <span className="text-xs text-gray-400 ml-1">
                              ({getEventTypeLabel(event.type)})
                            </span>
                          </div>
                        </div>
                      ))}
                    
                    {match.events.length > 5 && (
                      <div className="text-center text-sm text-gray-400 mt-2">
                        +{match.events.length - 5} more events
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-2">
                    No events recorded
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-200 rounded-lg p-6 text-center">
          <p className="text-gray-400">No matches found for the selected filter</p>
        </div>
      )}
    </div>
  );
};

export default EventsListPage;