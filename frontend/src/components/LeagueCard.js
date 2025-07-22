import React from 'react';
import { Link } from 'react-router-dom';

const LeagueCard = ({ league }) => {
  return (
    <Link 
      to={`/league/${league._id}`}
      className="bg-dark-200 rounded-lg p-4 hover:bg-dark-300 transition-colors block"
    >
      <div className="flex items-center">
        {league.logo ? (
          <img 
            src={league.logo} 
            alt={league.name} 
            className="w-12 h-12 mr-3 object-contain"
          />
        ) : (
          <div className="w-12 h-12 mr-3 bg-dark-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{league.name.substring(0, 2)}</span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{league.name}</h3>
          {league.country && (
            <div className="flex items-center mt-1">
              {league.country.flag && (
                <img 
                  src={league.country.flag} 
                  alt={league.country.name} 
                  className="w-4 h-3 mr-1"
                />
              )}
              <p className="text-sm text-gray-400">{league.country.name}</p>
            </div>
          )}
        </div>
        <div className="ml-2">
          <span className="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default LeagueCard;