import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, isYesterday, addDays, subDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import { matchService, leagueService } from '../utils/api';

// Using API services instead of direct axios calls

const MatchesPage = () => {
  const { isAdmin } = useAuth();
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDate, setActiveDate] = useState('today');
  const [activeLeague, setActiveLeague] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchLeagues();
    
    if (['today', 'tomorrow', 'yesterday'].includes(activeDate)) {
      fetchMatchesByDay(activeDate);
      
      // Set selected date for display
      if (activeDate === 'today') {
        setSelectedDate(new Date());
      } else if (activeDate === 'tomorrow') {
        setSelectedDate(addDays(new Date(), 1));
      } else if (activeDate === 'yesterday') {
        setSelectedDate(subDays(new Date(), 1));
      }
    }
  }, [activeDate]);

  useEffect(() => {
    if (activeLeague !== 'all') {
      fetchMatchesByLeague(activeLeague);
    }
  }, [activeLeague]);

  const fetchLeagues = async () => {
    try {
      const res = await leagueService.getAll();
      setLeagues(res.data);
    } catch (err) {
      console.error('Error fetching leagues:', err);
    }
  };

  const fetchMatchesByDay = async (day) => {
    try {
      setLoading(true);
      setError(null);
      setActiveLeague('all');
      
      const res = await matchService.getByDay(day);
      
      setMatches(res.data);
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching matches for ${day}:`, err);
      setError('Failed to load matches');
      setLoading(false);
    }
  };
  
  const fetchMatchesByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      setActiveLeague('all');
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const res = await matchService.getByDateRange(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      
      setMatches(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches by date:', err);
      setError('Failed to load matches');
      setLoading(false);
    }
  };

  const fetchMatchesByLeague = async (leagueId) => {
    try {
      setLoading(true);
      setError(null);
      setActiveDate('custom');
      
      const res = await matchService.getByLeague(leagueId);
      setMatches(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches by league:', err);
      setError('Failed to load matches');
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setActiveDate(date);
  };

  const handleLeagueChange = (leagueId) => {
    setActiveLeague(leagueId);
  };

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
          matches: []
        };
      }
      
      grouped[leagueId].matches.push(match);
    });
    
    // Sort matches within each league by date
    Object.values(grouped).forEach(league => {
      league.matches.sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
    });
    
    return Object.values(grouped);
  };

  const matchesByLeague = groupMatchesByLeague(matches);

  const formatMatchDate = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEE, MMM d');
    }
  };

  const formatMatchTime = (dateString) => {
    return format(parseISO(dateString), 'h:mm a');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Matches</h1>
        
        {isAdmin && (
          <Link 
            to="/admin/matches" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Manage Matches
          </Link>
        )}
      </div>
      
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
      
      {/* League Filter */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            activeLeague === 'all' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => handleLeagueChange('all')}
        >
          All Leagues
        </button>
        
        {leagues.map((league) => (
          <button
            key={league._id}
            className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
              activeLeague === league._id ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
            }`}
            onClick={() => handleLeagueChange(league._id)}
          >
            {league.name}
          </button>
        ))}
      </div>
      
      {/* Date Display */}
      {activeDate !== 'custom' && (
        <h2 className="text-xl font-semibold mb-4">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      )}
      
      {/* Matches List */}
      {matchesByLeague.length > 0 ? (
        matchesByLeague.map((league) => (
          <div key={league.id} className="mb-8">
            <div className="flex items-center mb-4">
              <h3 className="font-semibold text-lg">{league.name}</h3>
              {league.country && (
                <span className="ml-2 text-sm text-gray-400">{league.country}</span>
              )}
            </div>
            
            <div className="space-y-2">
              {league.matches.map((match) => (
                <Link 
                  key={match._id} 
                  to={`/match/${match._id}`}
                  className="block"
                >
                  <MatchCard match={match} />
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-dark-200 rounded-lg p-6 text-center">
          <p className="text-gray-400">No matches found for the selected date/league</p>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;