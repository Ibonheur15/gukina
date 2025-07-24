import React from 'react';
import { Link } from 'react-router-dom';
import useLiveMinute from '../hooks/useLiveMinute';

const LiveMatchCard = ({ match }) => {
  const currentMinute = useLiveMinute(match);

  const getStatusDisplay = () => {
    if (match.status === 'live') {
      return `${currentMinute}'`;
    } else if (match.status === 'halftime') {
      return 'HT';
    } else if (match.status === 'ended') {
      return 'FT';
    }
    return match.status;
  };

  return (
    <Link to={`/match/${match._id}`} className="block">
      <div className="bg-dark-200 rounded-lg p-3 hover:bg-dark-300 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-center">
              <div className="flex items-center space-x-2 mb-1">
                {match.homeTeam?.logo && (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{match.homeTeam?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {match.awayTeam?.logo && (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{match.awayTeam?.name}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold mb-1">
              {match.homeScore} - {match.awayScore}
            </div>
            <div className={`text-sm px-2 py-1 rounded ${
              match.status === 'live' ? 'bg-green-600 text-white' : 
              match.status === 'halftime' ? 'bg-yellow-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {getStatusDisplay()}
            </div>
          </div>
        </div>
        
        {match.league && (
          <div className="mt-2 text-sm text-gray-400">
            {match.league.name}
          </div>
        )}
      </div>
    </Link>
  );
};

export default LiveMatchCard;