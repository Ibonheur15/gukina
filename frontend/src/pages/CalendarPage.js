import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import Calendar from '../components/Calendar';
import MatchCard from '../components/MatchCard';
import { matchService } from '../utils/api';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchMatchesByDate(selectedDate);
  }, [selectedDate]);

  const fetchMatchesByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      const start = startOfDay(date).toISOString();
      const end = endOfDay(date).toISOString();
      
      const response = await matchService.getByDateRange(start, end);
      setMatches(response.data || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches for the selected date');
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (window.innerWidth < 768) {
      setShowCalendar(false); // Hide calendar on mobile after date selection
    }
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
          name: leagueName,
          country: match.league.country?.name || '',
          matches: []
        };
      }
      
      grouped[leagueId].matches.push(match);
    });
    
    return Object.values(grouped);
  };

  const matchesByLeague = groupMatchesByLeague(matches);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Match Calendar</h1>
      
      <div className="flex flex-col md:flex-row">
        {/* Calendar - Hidden on mobile by default */}
        <div className={`md:block md:w-64 md:mr-6 mb-6 ${showCalendar ? 'block' : 'hidden'}`}>
          <Calendar 
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />
        </div>
        
        {/* Matches for selected date */}
        <div className="flex-1">
          {/* Mobile calendar toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center justify-between w-full bg-dark-200 p-3 rounded-lg"
            >
              <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {/* Date display (desktop) */}
          <div className="hidden md:block mb-4">
            <h2 className="text-xl font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md">
              {error}
            </div>
          ) : matchesByLeague.length > 0 ? (
            matchesByLeague.map((league) => (
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
              <p className="text-gray-400">No matches scheduled for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;