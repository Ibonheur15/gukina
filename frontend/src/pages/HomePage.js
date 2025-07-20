import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MatchCard from '../components/MatchCard';
import { matchService, leagueService } from '../utils/api';

const HomePage = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDate, setActiveDate] = useState('today');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch live matches
        const liveRes = await matchService.getLive();
        setLiveMatches(liveRes.data);
        
        // Fetch today's matches
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        
        const todayRes = await matchService.getByDateRange(startOfDay, endOfDay);
        setTodayMatches(todayRes.data);
        
        // Fetch leagues
        const leaguesRes = await leagueService.getAll();
        setLeagues(leaguesRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load matches');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Group matches by league
  const groupMatchesByLeague = (matches) => {
    const grouped = {};
    
    matches.forEach(match => {
      const leagueId = match.league._id;
      const leagueName = match.league.name;
      
      if (!grouped[leagueId]) {
        grouped[leagueId] = {
          name: leagueName,
          country: match.league.country?.name || '',
          matches: []
        };
      }
      
      grouped[leagueId].matches.push(match);
    });
    
    return Object.values(grouped);
  };

  const liveMatchesByLeague = groupMatchesByLeague(liveMatches);
  const todayMatchesByLeague = groupMatchesByLeague(todayMatches);

  const handleDateChange = (date) => {
    setActiveDate(date);
    // In a real app, you would fetch matches for the selected date
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

  return (
    <div>
      {/* Date Navigation */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            activeDate === 'yesterday' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => handleDateChange('yesterday')}
        >
          Yesterday
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            activeDate === 'today' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => handleDateChange('today')}
        >
          Today
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            activeDate === 'tomorrow' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => handleDateChange('tomorrow')}
        >
          Tomorrow
        </button>
        <div className="text-gray-400 px-2">|</div>
        <button className="px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-md whitespace-nowrap">
          <span className="mr-1">Calendar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="live-badge mr-2">LIVE</span>
            <span>Live Matches</span>
          </h2>
          
          {liveMatchesByLeague.map((league) => (
            <div key={league.name} className="mb-6">
              <div className="flex items-center mb-2">
                <h3 className="font-semibold text-sm text-gray-300">{league.name}</h3>
                {league.country && (
                  <span className="ml-2 text-xs text-gray-400">{league.country}</span>
                )}
              </div>
              
              <div className="space-y-1">
                {league.matches.map((match) => (
                  <MatchCard key={match._id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Matches Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          {format(new Date(), 'EEEE, MMMM d')}
        </h2>
        
        {todayMatchesByLeague.length > 0 ? (
          todayMatchesByLeague.map((league) => (
            <div key={league.name} className="mb-6">
              <div className="flex items-center mb-2">
                <h3 className="font-semibold text-sm text-gray-300">{league.name}</h3>
                {league.country && (
                  <span className="ml-2 text-xs text-gray-400">{league.country}</span>
                )}
              </div>
              
              <div className="space-y-1">
                {league.matches.map((match) => (
                  <MatchCard key={match._id} match={match} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-dark-200 rounded-lg p-6 text-center">
            <p className="text-gray-400">No matches scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;