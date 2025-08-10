import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import { matchService, leagueService } from '../utils/api';

const HomePage = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDate, setActiveDate] = useState('today');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch live matches
        try {
          const liveRes = await matchService.getLive();
          setLiveMatches(liveRes.data || []);
        } catch (err) {
          console.error('Error fetching live matches:', err);
          setLiveMatches([]);
          // Don't set error yet, try to load other data
        }
        
        // Fetch today's matches using the day parameter
        try {
          const todayRes = await matchService.getByDay('today');
          setTodayMatches(todayRes.data || []);
        } catch (err) {
          console.error('Error fetching today matches:', err);
          setTodayMatches([]);
        }
        
        // Fetch leagues
        try {
          const leaguesRes = await leagueService.getAll();
          setLeagues(leaguesRes.data || []);
        } catch (err) {
          console.error('Error fetching leagues:', err);
          setLeagues([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('General error:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Group matches by league
  const groupMatchesByLeague = (matches) => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return [];
    }
    
    const grouped = {};
    
    matches.forEach(match => {
      if (!match.league || !match.league._id) return;
      
      const leagueId = match.league._id;
      const leagueName = match.league.name;
      
      if (!grouped[leagueId]) {
        grouped[leagueId] = {
          id: leagueId,
          name: leagueName,
          country: match.league.country?.name || '',
          priority: match.league.priority || 0,
          matches: []
        };
      }
      
      grouped[leagueId].matches.push(match);
    });
    
    // Sort matches within each league by date (most recent first)
    Object.values(grouped).forEach(league => {
      league.matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
    });
    
    // Sort leagues by priority (highest first)
    return Object.values(grouped).sort((a, b) => b.priority - a.priority);
  };

  const liveMatchesByLeague = groupMatchesByLeague(liveMatches);
  const todayMatchesByLeague = groupMatchesByLeague(todayMatches);

  const handleDateChange = async (date) => {
    setActiveDate(date);
    setLoading(true);
    
    // Update the displayed date
    const today = new Date();
    let newDate;
    if (date === 'yesterday') {
      newDate = subDays(today, 1);
    } else if (date === 'tomorrow') {
      newDate = addDays(today, 1);
    } else {
      newDate = today;
    }
    setCurrentDate(newDate);
    
    try {
      // Fetch matches for the selected date
      const matchesRes = await matchService.getByDay(date);
      setTodayMatches(matchesRes.data || []);
    } catch (err) {
      console.error(`Error fetching matches for ${date}:`, err);
      setTodayMatches([]);
    }
    
    setLoading(false);
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
        <Link to="/calendar" className="px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-md whitespace-nowrap">
          <span className="mr-1">Calendar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </Link>
      </div>

      {/* Empty state handled in the Today's Matches section */}

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
          {format(currentDate, 'EEEE, MMMM d')}
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
            <p className="text-gray-400">No matches scheduled for {activeDate === 'today' ? 'today' : activeDate}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-400"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;