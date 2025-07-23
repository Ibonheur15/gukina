import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { teamService, matchService } from '../utils/api';
import MatchCard from '../components/MatchCard';

const TeamPage = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch team details
        const teamRes = await teamService.getById(teamId);
        setTeam(teamRes.data);
        
        // Fetch team matches
        const matchesRes = await matchService.getByTeam(teamId);
        const matches = matchesRes.data || [];
        
        // Split matches into recent and upcoming
        const now = new Date();
        const recent = [];
        const upcoming = [];
        
        matches.forEach(match => {
          const matchDate = new Date(match.matchDate);
          if (matchDate < now || match.status === 'ended') {
            recent.push(match);
          } else {
            upcoming.push(match);
          }
        });
        
        // Sort recent matches by date (most recent first)
        recent.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
        setRecentMatches(recent.slice(0, 5)); // Show only 5 most recent
        
        // Sort upcoming matches by date (soonest first)
        upcoming.sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
        setUpcomingMatches(upcoming.slice(0, 5)); // Show only 5 upcoming
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data');
        setLoading(false);
      }
    };
    
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md">
        {error || 'Team not found'}
      </div>
    );
  }
  
  return (
    <div>
      {/* Team Header */}
      <div className="bg-dark-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-24 h-24 mr-6 object-contain" />
          ) : (
            <div className="w-24 h-24 bg-dark-300 rounded-full mr-6 flex items-center justify-center">
              <span className="text-3xl font-bold">{team.shortName || team.name.substring(0, 2)}</span>
            </div>
          )}
          
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <div className="flex items-center mt-2">
              {team.country && (
                <div className="flex items-center mr-4">
                  {team.country.flag && (
                    <img src={team.country.flag} alt={team.country.name} className="w-5 h-3 mr-2" />
                  )}
                  <span className="text-gray-400">{team.country.name}</span>
                </div>
              )}
              
              {team.league && (
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">League:</span>
                  <Link to={`/league/${team.league._id}`} className="text-primary hover:underline">
                    {team.league.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-dark-300 mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'matches' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Team Info */}
          <div className="bg-dark-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Team Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">
                  <span className="text-gray-400">Full Name:</span> {team.name}
                </p>
                <p className="mb-2">
                  <span className="text-gray-400">Short Name:</span> {team.shortName || 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="text-gray-400">Country:</span> {team.country ? team.country.name : 'N/A'}
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <span className="text-gray-400">City:</span> {team.city || 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="text-gray-400">Stadium:</span> {team.stadium || 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="text-gray-400">Founded:</span> {team.foundedYear || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Recent Matches */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
            {recentMatches.length > 0 ? (
              <div className="space-y-2">
                {recentMatches.map(match => (
                  <Link key={match._id} to={`/match/${match._id}`} className="block">
                    <MatchCard match={match} highlightTeam={teamId} />
                  </Link>
                ))}
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="text-primary hover:underline flex items-center"
                  >
                    View all matches
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-dark-300 rounded-lg p-6 text-center">
                <p className="text-gray-400">No recent matches found</p>
              </div>
            )}
          </div>
          
          {/* Upcoming Matches */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-2">
                {upcomingMatches.map(match => (
                  <Link key={match._id} to={`/match/${match._id}`} className="block">
                    <MatchCard match={match} highlightTeam={teamId} />
                  </Link>
                ))}
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="text-primary hover:underline flex items-center"
                  >
                    View all matches
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-dark-300 rounded-lg p-6 text-center">
                <p className="text-gray-400">No upcoming matches found</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'matches' && (
        <div>
          {/* All Matches */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">All Matches</h2>
            {recentMatches.length > 0 || upcomingMatches.length > 0 ? (
              <div>
                {/* Upcoming Matches */}
                {upcomingMatches.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Upcoming</h3>
                    <div className="space-y-2">
                      {upcomingMatches.map(match => (
                        <Link key={match._id} to={`/match/${match._id}`} className="block">
                          <MatchCard match={match} highlightTeam={teamId} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recent Matches */}
                {recentMatches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent</h3>
                    <div className="space-y-2">
                      {recentMatches.map(match => (
                        <Link key={match._id} to={`/match/${match._id}`} className="block">
                          <MatchCard match={match} highlightTeam={teamId} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-dark-300 rounded-lg p-6 text-center">
                <p className="text-gray-400">No matches found</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'stats' && (
        <div className="bg-dark-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Team Statistics</h2>
          <p className="text-gray-400 text-center">Statistics will be available soon</p>
        </div>
      )}
    </div>
  );
};

export default TeamPage;