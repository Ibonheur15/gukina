import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import useLiveMinute from '../hooks/useLiveMinute';
import '../styles/live-match.css';

const MatchCard = ({ match, highlightTeam }) => {
  const liveMinute = useLiveMinute(match);
  
  // Check if match has required data
  if (!match || !match.homeTeam || !match.awayTeam) {
    return (
      <div className="match-card block bg-dark-300 p-2 rounded">
        <div className="text-center text-gray-400">Match data unavailable</div>
      </div>
    );
  }
  const getStatusDisplay = () => {
    switch (match.status) {
      case 'live':
        return (
          <span className="live-badge">
            {liveMinute}'  
          </span>
        );
      case 'halftime':
        return <span className="live-badge">HT</span>;
      case 'ended':
        return <span className="text-gray-400">FT</span>;
      case 'not_started':
        return <span className="text-gray-400">{format(new Date(match.matchDate), 'HH:mm')}</span>;
      case 'postponed':
        return <span className="text-yellow-500">PPD</span>;
      case 'canceled':
        return <span className="text-red-500">CANC</span>;
      default:
        return <span className="text-gray-400">{format(new Date(match.matchDate), 'HH:mm')}</span>;
    }
  };

  return (
    <Link to={`/match/${match._id}`} className={`match-card block bg-dark-200 p-2 rounded-md hover:bg-dark-300 ${highlightTeam ? 'transition-all duration-200' : ''}`}>
      <div className="flex items-center">
        <div className="w-12 text-center text-sm">
          {getStatusDisplay()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-dark-300 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                {match.homeTeam.logo ? (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">{match.homeTeam.shortName ? match.homeTeam.shortName.substring(0, 2) : match.homeTeam.name.substring(0, 2)}</span>
                )}
              </div>
              <span className={`text-sm font-medium ${highlightTeam === match.homeTeam._id ? 'text-primary' : ''}`}>
                {match.homeTeam.name}
              </span>
            </div>
            
            {(match.status === 'live' || match.status === 'halftime' || match.status === 'ended') && (
              <span className="font-bold">{match.homeScore}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-dark-300 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                {match.awayTeam.logo ? (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">{match.awayTeam.shortName ? match.awayTeam.shortName.substring(0, 2) : match.awayTeam.name.substring(0, 2)}</span>
                )}
              </div>
              <span className={`text-sm font-medium ${highlightTeam === match.awayTeam._id ? 'text-primary' : ''}`}>
                {match.awayTeam.name}
              </span>
            </div>
            
            {(match.status === 'live' || match.status === 'halftime' || match.status === 'ended') && (
              <span className="font-bold">{match.awayScore}</span>
            )}
          </div>
        </div>
        
        <div className="w-8 flex justify-center">
          <button className="text-gray-400 hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default MatchCard;