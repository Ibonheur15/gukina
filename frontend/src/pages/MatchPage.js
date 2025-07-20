import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { matchService } from '../utils/api';

const MatchPage = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const res = await matchService.getById(matchId);
        setMatch(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load match details');
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const getStatusDisplay = () => {
    if (!match) return '';
    
    switch (match.status) {
      case 'live':
        return <span className="live-badge">LIVE</span>;
      case 'halftime':
        return <span className="live-badge">HT</span>;
      case 'ended':
        return <span className="text-gray-400">Full Time</span>;
      case 'not_started':
        return <span className="text-gray-400">Not Started</span>;
      case 'postponed':
        return <span className="text-yellow-500">Postponed</span>;
      case 'canceled':
        return <span className="text-red-500">Canceled</span>;
      default:
        return <span className="text-gray-400">Not Started</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md">
        {error || 'Match not found'}
      </div>
    );
  }

  return (
    <div>
      {/* Match Header */}
      <div className="bg-dark-200 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-400 mb-1">
            {match.league.name} - {format(new Date(match.matchDate), 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="text-sm mb-4">
            {getStatusDisplay()}
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-center w-1/3">
              <div className="w-16 h-16 bg-dark-300 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                {match.homeTeam.logo ? (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{match.homeTeam.shortName.substring(0, 2)}</span>
                )}
              </div>
              <div className="font-medium">{match.homeTeam.name}</div>
            </div>
            
            <div className="w-1/3 flex items-center justify-center">
              {(match.status === 'live' || match.status === 'halftime' || match.status === 'ended') ? (
                <div className="text-3xl font-bold">
                  {match.homeScore} - {match.awayScore}
                </div>
              ) : (
                <div className="text-xl font-medium text-gray-400">
                  {format(new Date(match.matchDate), 'HH:mm')}
                </div>
              )}
            </div>
            
            <div className="text-center w-1/3">
              <div className="w-16 h-16 bg-dark-300 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                {match.awayTeam.logo ? (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{match.awayTeam.shortName.substring(0, 2)}</span>
                )}
              </div>
              <div className="font-medium">{match.awayTeam.name}</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            {match.venue}
          </div>
        </div>
      </div>
      
      {/* Match Events */}
      {match.events && match.events.length > 0 && (
        <div className="bg-dark-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Match Events</h2>
          
          <div className="space-y-4">
            {match.events
              .sort((a, b) => a.minute - b.minute)
              .map((event, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-right mr-4 font-medium">
                    {event.minute}'
                  </div>
                  
                  <div className="w-8 text-center mr-4">
                    {event.type === 'goal' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                    {event.type === 'yellow_card' && (
                      <div className="w-3 h-4 bg-yellow-400 mx-auto"></div>
                    )}
                    {event.type === 'red_card' && (
                      <div className="w-3 h-4 bg-red-600 mx-auto"></div>
                    )}
                    {event.type === 'substitution' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">
                      {event.player}
                      {event.type === 'goal' && ' ⚽ Goal'}
                      {event.type === 'yellow_card' && ' 🟨 Yellow Card'}
                      {event.type === 'red_card' && ' 🟥 Red Card'}
                      {event.type === 'substitution' && ' 🔄 Substitution'}
                    </div>
                    {event.additionalInfo && (
                      <div className="text-sm text-gray-400">{event.additionalInfo}</div>
                    )}
                  </div>
                  
                  <div className="w-24 text-right text-sm">
                    {event.team.name}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Team Links */}
      <div className="flex justify-between">
        <Link 
          to={`/team/${match.homeTeam._id}`}
          className="bg-dark-200 hover:bg-dark-300 rounded-lg p-4 w-[48%] text-center"
        >
          <div className="font-medium">{match.homeTeam.name}</div>
          <div className="text-sm text-gray-400 mt-1">Team Details</div>
        </Link>
        
        <Link 
          to={`/team/${match.awayTeam._id}`}
          className="bg-dark-200 hover:bg-dark-300 rounded-lg p-4 w-[48%] text-center"
        >
          <div className="font-medium">{match.awayTeam.name}</div>
          <div className="text-sm text-gray-400 mt-1">Team Details</div>
        </Link>
      </div>
      
      {/* League Link */}
      <Link 
        to={`/league/${match.league._id}`}
        className="bg-dark-200 hover:bg-dark-300 rounded-lg p-4 mt-4 block text-center"
      >
        <div className="font-medium">{match.league.name}</div>
        <div className="text-sm text-gray-400 mt-1">View League Table</div>
      </Link>
    </div>
  );
};

export default MatchPage;