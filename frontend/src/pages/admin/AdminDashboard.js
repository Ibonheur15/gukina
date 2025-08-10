import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { countryService, leagueService, teamService, matchService } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    countries: 0,
    leagues: 0,
    teams: 0,
    matches: 0,
    liveMatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch counts
        const [countriesRes, leaguesRes, teamsRes, matchesRes, liveMatchesRes] = await Promise.all([
          countryService.getAll(),
          leagueService.getAll(),
          teamService.getAll(),
          matchService.getAll(),
          matchService.getLive()
        ]);
        
        setStats({
          countries: countriesRes.data.length,
          leagues: leaguesRes.data.length,
          teams: teamsRes.data.length,
          matches: matchesRes.data.length,
          liveMatches: liveMatchesRes.data.length
        });
        
        // Get recent matches (limit to 5)
        setRecentMatches(matchesRes.data.slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-dark-200 rounded-lg p-6 flex flex-col">
          <span className="text-gray-400 text-sm">Countries</span>
          <span className="text-3xl font-bold mt-2">{stats.countries}</span>
          <Link to="/admin/countries" className="text-primary text-sm mt-auto">
            Manage Countries →
          </Link>
        </div>
        
        <div className="bg-dark-200 rounded-lg p-6 flex flex-col">
          <span className="text-gray-400 text-sm">Leagues</span>
          <span className="text-3xl font-bold mt-2">{stats.leagues}</span>
          <Link to="/admin/leagues" className="text-primary text-sm mt-auto">
            Manage Leagues →
          </Link>
        </div>
        
        <div className="bg-dark-200 rounded-lg p-6 flex flex-col">
          <span className="text-gray-400 text-sm">Teams</span>
          <span className="text-3xl font-bold mt-2">{stats.teams}</span>
          <Link to="/admin/teams" className="text-primary text-sm mt-auto">
            Manage Teams →
          </Link>
        </div>
        
        <div className="bg-dark-200 rounded-lg p-6 flex flex-col">
          <span className="text-gray-400 text-sm">Matches</span>
          <span className="text-3xl font-bold mt-2">{stats.matches}</span>
          <Link to="/admin/matches" className="text-primary text-sm mt-auto">
            Manage Matches →
          </Link>
        </div>
        
        <div className="bg-dark-200 rounded-lg p-6 flex flex-col">
          <span className="text-gray-400 text-sm">Live Matches</span>
          <span className="text-3xl font-bold mt-2">{stats.liveMatches}</span>
          <Link to="/admin/matches" className="text-primary text-sm mt-auto">
            View Live Matches →
          </Link>
        </div>
      </div>
      
      {/* Recent Matches */}
      <div className="bg-dark-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
        
        {recentMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">League</th>
                  <th className="pb-2">Home Team</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Away Team</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((match) => (
                  <tr key={match._id} className="border-t border-dark-300">
                    <td className="py-3 text-sm">
                      {new Date(match.matchDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm">
                      {match.league?.name || 'N/A'}
                    </td>
                    <td className="py-3">
                      {match.homeTeam?.name || 'N/A'}
                    </td>
                    <td className="py-3 font-medium">
                      {match.status !== 'not_started' ? `${match.homeScore} - ${match.awayScore}` : '-'}
                    </td>
                    <td className="py-3">
                      {match.awayTeam?.name || 'N/A'}
                    </td>
                    <td className="py-3">
                      {match.status === 'live' && <span className="live-badge">LIVE</span>}
                      {match.status === 'halftime' && <span className="live-badge">HT</span>}
                      {match.status === 'ended' && <span className="text-gray-400">Ended</span>}
                      {match.status === 'not_started' && <span className="text-gray-400">Not Started</span>}
                      {match.status === 'postponed' && <span className="text-yellow-500">Postponed</span>}
                      {match.status === 'canceled' && <span className="text-red-500">Canceled</span>}
                    </td>
                    <td className="py-3">
                      <Link 
                        to={`/admin/matches?edit=${match._id}`} 
                        className="text-primary hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No matches found</p>
        )}
        
        <div className="mt-4 text-right">
          <Link to="/admin/matches" className="text-primary hover:underline">
            View All Matches →
          </Link>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-dark-200 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/admin/countries?new=true" 
            className="bg-dark-300 hover:bg-dark-400 rounded-lg p-4 text-center"
          >
            Add New Country
          </Link>
          <Link 
            to="/admin/leagues?new=true" 
            className="bg-dark-300 hover:bg-dark-400 rounded-lg p-4 text-center"
          >
            Add New League
          </Link>
          <Link 
            to="/admin/teams?new=true" 
            className="bg-dark-300 hover:bg-dark-400 rounded-lg p-4 text-center"
          >
            Add New Team
          </Link>
          <Link 
            to="/admin/matches?new=true" 
            className="bg-dark-300 hover:bg-dark-400 rounded-lg p-4 text-center"
          >
            Add New Match
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;