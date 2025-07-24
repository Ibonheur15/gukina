import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchService } from '../utils/api';
import useLiveMinute from '../hooks/useLiveMinute';
import { format } from 'date-fns';

const SingleMatchPage = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const liveMinute = useLiveMinute(match);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const response = await matchService.getById(matchId);
        setMatch(response.data);
      } catch (err) {
        setError('Failed to load match details');
        console.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  // Auto-refresh for live matches
  useEffect(() => {
    let interval;
    if (match && match.status === 'live') {
      interval = setInterval(async () => {
        try {
          const response = await matchService.getById(matchId);
          setMatch(response.data);
        } catch (err) {
          console.error('Error refreshing match:', err);
        }
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [match?.status, matchId]);

  const getStatusDisplay = () => {
    if (!match) return '';
    
    switch (match.status) {
      case 'live':
        return `${liveMinute}'`;
      case 'halftime':
        return 'Half Time';
      case 'ended':
        return 'Full Time';
      case 'not_started':
        return format(new Date(match.matchDate), 'MMM dd, yyyy HH:mm');
      case 'postponed':
        return 'Postponed';
      case 'canceled':
        return 'Canceled';
      default:
        return match.status;
    }
  };

  const getStatusClass = () => {
    if (!match) return '';
    
    switch (match.status) {
      case 'live':
        return 'bg-green-600 text-white';
      case 'halftime':
        return 'bg-yellow-600 text-white';
      case 'ended':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="text-white">Loading match details...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Match not found'}</div>
          <Link to="/scores" className="text-primary hover:underline">
            Back to Scores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Link to="/scores" className="text-primary hover:underline mb-6 inline-block">
          ← Back to Scores
        </Link>

        {/* Match Header */}
        <div className="bg-dark-200 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusClass()}`}>
              {getStatusDisplay()}
            </div>
            {match.league && (
              <div className="text-gray-400 text-sm mt-2">
                {match.league.name}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Home Team */}
            <div className="text-center flex-1">
              <div className="flex items-center justify-center mb-2">
                {match.homeTeam?.logo && (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-12 h-12 mr-3" />
                )}
                <h2 className="text-xl font-bold">{match.homeTeam?.name}</h2>
              </div>
            </div>

            {/* Score */}
            <div className="text-center px-8">
              <div className="text-4xl font-bold mb-2">
                {match.homeScore} - {match.awayScore}
              </div>
            </div>

            {/* Away Team */}
            <div className="text-center flex-1">
              <div className="flex items-center justify-center mb-2">
                <h2 className="text-xl font-bold">{match.awayTeam?.name}</h2>
                {match.awayTeam?.logo && (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-12 h-12 ml-3" />
                )}
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm mt-4">
            {match.venue}
          </div>
        </div>

        {/* Match Events */}
        {match.events && match.events.length > 0 && (
          <div className="bg-dark-200 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Match Events</h3>
            <div className="space-y-3">
              {match.events.map((event, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-dark-300 last:border-b-0">
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-12">{event.minute}'</span>
                    <span className="capitalize text-sm">{event.type.replace('_', ' ')}</span>
                    <span className="ml-2 text-sm font-medium">{event.player}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {event.team?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleMatchPage;