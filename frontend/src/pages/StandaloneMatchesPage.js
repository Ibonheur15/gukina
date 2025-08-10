import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MatchCard from '../components/MatchCard';
import { matchService } from '../utils/api';

const StandaloneMatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandaloneMatches();
  }, []);

  const fetchStandaloneMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await matchService.getAll();
      const standaloneMatches = response.data.filter(match => match.isStandalone);
      setMatches(standaloneMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching standalone matches:', err);
      setError('Failed to load standalone matches');
      setLoading(false);
    }
  };

  const groupMatchesByLeague = (matches) => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return [];
    }
    
    const grouped = {};
    
    matches.forEach(match => {
      const leagueName = match.standaloneData?.leagueName || 'Unknown League';
      
      if (!grouped[leagueName]) {
        grouped[leagueName] = {
          name: leagueName,
          matches: []
        };
      }
      
      grouped[leagueName].matches.push(match);
    });
    
    // Sort matches within each league by date (most recent first)
    Object.values(grouped).forEach(league => {
      league.matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
    });
    
    return Object.values(grouped);
  };

  const matchesByLeague = groupMatchesByLeague(matches);

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
        <button 
          className="block mt-4 px-4 py-2 bg-red-500 text-white rounded-md mx-auto"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Standalone Matches</h1>
      <p className="text-gray-400 mb-6">Special matches not part of regular league competitions</p>
      
      {matchesByLeague.length > 0 ? (
        matchesByLeague.map((league) => (
          <div key={league.name} className="mb-8">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">{league.name}</h2>
              <span className="ml-3 px-2 py-1 bg-purple-900 bg-opacity-30 text-purple-400 text-xs rounded">
                Standalone
              </span>
            </div>
            
            <div className="space-y-2">
              {league.matches.map((match) => (
                <MatchCard key={match._id} match={match} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-dark-200 rounded-lg p-6 text-center">
          <p className="text-gray-400">No standalone matches found</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-400"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default StandaloneMatchesPage;