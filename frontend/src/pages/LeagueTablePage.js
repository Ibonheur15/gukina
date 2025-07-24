import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import { leagueService, standingService, seasonService, fixService } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';

// Helper function to format season display (e.g., "2023/24")
const formatSeasonDisplay = (seasonYear) => {
  return `${seasonYear}/${(parseInt(seasonYear) + 1).toString().slice(-2)}`;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LeagueTablePage = () => {
  const { leagueId } = useParams();
  const { token } = useAuth();
  const [leagueData, setLeagueData] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [activeTab, setActiveTab] = useState('standings');
  
  // Validate league ID format
  useEffect(() => {
    if (!leagueId || !leagueId.match(/^[0-9a-fA-F]{24}$/)) {
      setError('Invalid league ID format');
      setLoading(false);
    }
  }, [leagueId]);

  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching league with ID:', leagueId, 'for season:', season);
      
      // Fetch league data with season parameter (now includes standings)
      try {
        const leagueRes = await leagueService.getById(leagueId, season);
        console.log('League data received for season', season, ':', leagueRes.data);
        setLeagueData(leagueRes.data);
        
        // Set available seasons from league response
        if (leagueRes.data.availableSeasons && leagueRes.data.availableSeasons.length > 0) {
          console.log('Available seasons from API:', leagueRes.data.availableSeasons);
          setAvailableSeasons(leagueRes.data.availableSeasons);
        }
        
        // Set standings from league response
        if (leagueRes.data.standings && leagueRes.data.standings.length > 0) {
          console.log('Standings received from league response:', leagueRes.data.standings.length);
          setStandings(leagueRes.data.standings);
        } else {
          console.log('No standings in league response, checking if we need to generate them');
          
          // If we have teams but no standings, show empty state
          if (leagueRes.data.teams && leagueRes.data.teams.length > 0) {
            console.log('League has teams but no standings for this season');
            setStandings([]);
          } else {
            console.log('No teams found for this league');
            setStandings([]);
          }
        }
      } catch (err) {
        console.error('Error fetching league:', err);
        if (err.response && err.response.status === 404) {
          setError('League not found. Please check the league ID.');
        } else {
          setError(`Failed to load league: ${err.message || 'Unknown error'}`);
        }
        setLoading(false);
        return;
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching league data:', err);
      setError(`Failed to load league data: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Auto-refresh for live matches
  useEffect(() => {
    let interval;
    
    // Check if there are live matches in this league
    const hasLiveMatches = standings.some(standing => standing.isLive);
    
    if (hasLiveMatches) {
      // Refresh every 30 seconds if there are live matches
      interval = setInterval(() => {
        fetchLeagueData();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [standings]);

  useEffect(() => {
    if (leagueId) {
      fetchLeagueData();
    }
  }, [leagueId, season]);

  // Fetch seasons separately if not available in league data
  useEffect(() => {
    const fetchSeasons = async () => {
      if (leagueId && (!availableSeasons || availableSeasons.length === 0)) {
        try {
          const res = await seasonService.getByLeague(leagueId);
          if (res.data && res.data.length > 0) {
            console.log('Seasons fetched:', res.data);
            setAvailableSeasons(res.data);
            
            // If current season is not in available seasons, set to first available
            if (!res.data.includes(season)) {
              setSeason(res.data[0]);
            }
          }
        } catch (err) {
          console.error('Error fetching seasons:', err);
          // Use default seasons if API fails
          const defaultSeasons = [
            new Date().getFullYear().toString(),
            (new Date().getFullYear() - 1).toString(),
            (new Date().getFullYear() - 2).toString()
          ];
          setAvailableSeasons(defaultSeasons);
        }
      }
    };
    
    fetchSeasons();
  }, [leagueId, season, availableSeasons.length]);

  const handleSeasonChange = (e) => {
    setSeason(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !leagueData || !leagueData.league) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md">
        {error || 'League not found'}
      </div>
    );
  }

  const { league, teams = [], recentMatches = [], upcomingMatches = [] } = leagueData;

  return (
    <div>
      {/* League Header */}
      <div className="bg-dark-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          {league && league.logo ? (
            <img src={league.logo} alt={league.name} className="w-16 h-16 mr-4 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-dark-300 rounded-full mr-4 flex items-center justify-center">
              <span className="text-xl font-bold">{league && league.name ? league.name.substring(0, 2) : 'L'}</span>
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold">{league ? league.name : 'League'}</h1>
            <div className="flex items-center mt-1">
              {league && league.country && (
                <>
                  {league.country.flag && (
                    <img src={league.country.flag} alt={league.country.name} className="w-5 h-3 mr-2" />
                  )}
                  <span className="text-gray-400">{league.country.name}</span>
                </>
              )}
              <span className="ml-2 px-2 py-0.5 bg-primary bg-opacity-20 text-primary text-xs rounded">
                {formatSeasonDisplay(season)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-dark-300 mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'standings' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('standings')}
        >
          Standings
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'matches' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'teams' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
      </div>
      
      {/* Season Selector */}
      <div className="mb-6 flex items-center">
        <label htmlFor="season-select" className="mr-2 text-gray-400">Season:</label>
        <select
          id="season-select"
          value={season}
          onChange={handleSeasonChange}
          className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2"
        >
          {availableSeasons && availableSeasons.length > 0 ? (
            availableSeasons.map(seasonYear => (
              <option key={seasonYear} value={seasonYear}>
                {formatSeasonDisplay(seasonYear)}
              </option>
            ))
          ) : (
            <>
              <option value={new Date().getFullYear().toString()}>
                {formatSeasonDisplay(new Date().getFullYear().toString())}
              </option>
              <option value={(new Date().getFullYear() - 1).toString()}>
                {formatSeasonDisplay((new Date().getFullYear() - 1).toString())}
              </option>
              <option value={(new Date().getFullYear() - 2).toString()}>
                {formatSeasonDisplay((new Date().getFullYear() - 2).toString())}
              </option>
            </>
          )}
        </select>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'standings' && (
        <div className="bg-dark-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-300">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-center">P</th>
                  <th className="px-4 py-2 text-center">W</th>
                  <th className="px-4 py-2 text-center">D</th>
                  <th className="px-4 py-2 text-center">L</th>
                  <th className="px-4 py-2 text-center">GF</th>
                  <th className="px-4 py-2 text-center">GA</th>
                  <th className="px-4 py-2 text-center">GD</th>
                  <th className="px-4 py-2 text-center">Pts</th>
                  <th className="px-4 py-2 text-center">Form</th>
                </tr>
              </thead>
              <tbody>
                {standings.filter(standing => standing.team).length > 0 ? (
                  standings.filter(standing => standing.team).map((standing) => (
                    <tr key={standing._id} className="border-t border-dark-300 hover:bg-dark-300">
                      <td className="px-3 py-2 text-center text-sm">{standing.position}</td>
                      <td className="px-4 py-3">
                        <Link to={`/team/${standing.team._id}`} className="flex items-center">
                          {standing.team.logo ? (
                            <img src={standing.team.logo} alt={standing.team.name} className="w-5 h-5 mr-2 object-contain" />
                          ) : (
                            <div className="w-5 h-5 bg-dark-400 rounded-full mr-2 flex items-center justify-center">
                              <span className="text-xs">{standing.team.shortName ? standing.team.shortName.substring(0, 2) : (standing.team.name ? standing.team.name.substring(0, 2) : 'T')}</span>
                            </div>
                          )}
                          <span className={`text-sm ${standing.isLive ? 'text-green-400' : ''}`}>{standing.team.name}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-center text-sm">{standing.played}</td>
                      <td className="px-3 py-2 text-center text-sm">{standing.won}</td>
                      <td className="px-3 py-2 text-center text-sm">{standing.drawn}</td>
                      <td className="px-3 py-2 text-center text-sm">{standing.lost}</td>
                      <td className="px-3 py-2 text-center text-sm">{standing.goalsFor}</td>
                      <td className="px-3 py-2 text-center text-sm">{standing.goalsAgainst}</td>
                      <td className="px-3 py-2 text-center text-sm">{standing.goalsFor - standing.goalsAgainst}</td>
                      <td className="px-3 py-2 text-center text-sm font-bold">{standing.points}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center space-x-1">
                          {standing.form.map((result, index) => (
                            <span 
                              key={index} 
                              className={`w-4 h-4 flex items-center justify-center text-xs rounded-full
                                ${result === 'W' ? 'bg-green-600' : 
                                  result === 'D' ? 'bg-yellow-600' : 'bg-red-600'}`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-4 py-6 text-center text-gray-400">
                      <p>No standings data available for this season</p>
                      {teams && teams.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2">Standings will be generated automatically.</p>
                          <div className="flex justify-center space-x-4">
                            <button 
                              onClick={() => window.location.reload()} 
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                            >
                              Refresh
                            </button>
                            <button 
                              onClick={() => {
                                // Show loading message
                                alert('Recalculating standings from match results... This may take a moment.');
                                
                                // Call recalculate endpoint
                                axios.post(
                                  `${API_URL}/standings/recalculate/${leagueId}`,
                                  { season: season },
                                  {
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`
                                    }
                                  }
                                )
                                  .then(res => {
                                    console.log('Recalculate response:', res.data);
                                    alert(`Standings recalculated successfully! Refreshing page...`);
                                    window.location.reload();
                                  })
                                  .catch(err => {
                                    console.error('Recalculate error:', err);
                                    alert('Error recalculating standings. Please try again.');
                                  });
                              }} 
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Recalculate Standings
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'matches' && (
        <div>
          {/* Recent Matches */}
          <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
          {recentMatches && recentMatches.length > 0 ? (
            <div className="space-y-2 mb-6">
              {recentMatches.map(match => (
                <Link key={match._id} to={`/match/${match._id}`} className="block">
                  <MatchCard match={match} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-dark-200 rounded-lg p-6 text-center mb-6">
              <p className="text-gray-400">No recent matches</p>
            </div>
          )}
          
          {/* Upcoming Matches */}
          <h2 className="text-xl font-bold mb-4">Upcoming Matches</h2>
          {upcomingMatches && upcomingMatches.length > 0 ? (
            <div className="space-y-2">
              {upcomingMatches.map(match => (
                <Link key={match._id} to={`/match/${match._id}`} className="block">
                  <MatchCard match={match} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-dark-200 rounded-lg p-6 text-center">
              <p className="text-gray-400">No upcoming matches</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'teams' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams && teams.length > 0 ? (
            teams.map(team => (
              <Link 
                key={team._id} 
                to={`/team/${team._id}`}
                className="bg-dark-200 rounded-lg p-4 flex flex-col items-center hover:bg-dark-300"
              >
                {team.logo ? (
                  <img src={team.logo} alt={team.name} className="w-16 h-16 mb-2 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-dark-300 rounded-full mb-2 flex items-center justify-center">
                    <span className="text-xl font-bold">{team.shortName ? team.shortName.substring(0, 2) : team.name.substring(0, 2)}</span>
                  </div>
                )}
                <h3 className="font-medium text-center">{team.name}</h3>
              </Link>
            ))
          ) : (
            <div className="col-span-full bg-dark-200 rounded-lg p-6 text-center">
              <p className="text-gray-400">No teams in this league</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeagueTablePage;