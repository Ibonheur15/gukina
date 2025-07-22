import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TeamsPage = () => {
  const { isAdmin } = useAuth();
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeLeague, setActiveLeague] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all teams
        const teamsRes = await axios.get(`${API_URL}/teams`);
        setTeams(teamsRes.data);
        
        // Fetch all countries
        const countriesRes = await axios.get(`${API_URL}/countries`);
        setCountries(countriesRes.data);
        
        // Fetch all leagues
        const leaguesRes = await axios.get(`${API_URL}/leagues`);
        setLeagues(leaguesRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load teams');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCountryFilter = async (countryId) => {
    try {
      setLoading(true);
      setActiveCountry(countryId);
      setActiveLeague('all'); // Reset league filter when country changes
      
      if (countryId === 'all') {
        const res = await axios.get(`${API_URL}/teams`);
        setTeams(res.data);
      } else {
        const res = await axios.get(`${API_URL}/teams/country/${countryId}`);
        setTeams(res.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error filtering teams:', err);
      setError('Failed to filter teams');
      setLoading(false);
    }
  };

  const handleLeagueFilter = async (leagueId) => {
    try {
      setLoading(true);
      setActiveLeague(leagueId);
      
      if (leagueId === 'all') {
        if (activeCountry === 'all') {
          const res = await axios.get(`${API_URL}/teams`);
          setTeams(res.data);
        } else {
          const res = await axios.get(`${API_URL}/teams/country/${activeCountry}`);
          setTeams(res.data);
        }
      } else {
        const res = await axios.get(`${API_URL}/teams/league/${leagueId}`);
        setTeams(res.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error filtering teams by league:', err);
      setError('Failed to filter teams');
      setLoading(false);
    }
  };

  // Group teams by country
  const groupTeamsByCountry = () => {
    const grouped = {};
    
    teams.forEach(team => {
      if (!team.country) return;
      
      const countryId = team.country._id;
      const countryName = team.country.name;
      
      if (!grouped[countryId]) {
        grouped[countryId] = {
          name: countryName,
          flag: team.country.flag,
          teams: []
        };
      }
      
      grouped[countryId].teams.push(team);
    });
    
    // Sort teams alphabetically within each country
    Object.values(grouped).forEach(country => {
      country.teams.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  };

  const teamsByCountry = groupTeamsByCountry();

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
        <h1 className="text-2xl font-bold">Teams</h1>
        
        {isAdmin && (
          <Link 
            to="/admin/teams" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Manage Teams
          </Link>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-dark-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        
        {/* Country Filter */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Country</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                activeCountry === 'all' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
              }`}
              onClick={() => handleCountryFilter('all')}
            >
              All Countries
            </button>
            
            {countries.map((country) => (
              <button
                key={country._id}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  activeCountry === country._id ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
                }`}
                onClick={() => handleCountryFilter(country._id)}
              >
                {country.flag && (
                  <img 
                    src={country.flag} 
                    alt={country.name} 
                    className="w-4 h-4 mr-2 rounded-full object-cover"
                  />
                )}
                {country.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* League Filter */}
        <div>
          <h3 className="text-sm font-medium mb-2">League</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                activeLeague === 'all' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
              }`}
              onClick={() => handleLeagueFilter('all')}
            >
              All Leagues
            </button>
            
            {leagues
              .filter(league => activeCountry === 'all' || league.country._id === activeCountry)
              .map((league) => (
                <button
                  key={league._id}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeLeague === league._id ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
                  }`}
                  onClick={() => handleLeagueFilter(league._id)}
                >
                  {league.name}
                </button>
              ))}
          </div>
        </div>
      </div>
      
      {/* Teams List */}
      {teams.length > 0 ? (
        activeCountry === 'all' ? (
          // Group by country when showing all countries
          teamsByCountry.map((country) => (
            <div key={country.name} className="mb-8">
              <div className="flex items-center mb-4">
                {country.flag && (
                  <img 
                    src={country.flag} 
                    alt={country.name} 
                    className="w-6 h-6 mr-2 rounded-full object-cover"
                  />
                )}
                <h2 className="text-xl font-semibold">{country.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {country.teams.map((team) => (
                  <Link 
                    key={team._id} 
                    to={`/team/${team._id}`}
                    className="bg-dark-200 rounded-lg p-4 hover:bg-dark-300 transition-colors"
                  >
                    <div className="flex items-center">
                      {team.logo ? (
                        <img 
                          src={team.logo} 
                          alt={team.name} 
                          className="w-12 h-12 mr-3 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 mr-3 bg-dark-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{team.shortName}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        {team.city && (
                          <p className="text-sm text-gray-400">{team.city}</p>
                        )}
                        {team.leagues && team.leagues.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {team.leagues.map(l => l.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Simple grid when filtered by country or league
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teams.map((team) => (
              <Link 
                key={team._id} 
                to={`/team/${team._id}`}
                className="bg-dark-200 rounded-lg p-4 hover:bg-dark-300 transition-colors"
              >
                <div className="flex items-center">
                  {team.logo ? (
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      className="w-12 h-12 mr-3 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 mr-3 bg-dark-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">{team.shortName}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{team.name}</h3>
                    {team.city && (
                      <p className="text-sm text-gray-400">{team.city}</p>
                    )}
                    {team.leagues && team.leagues.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {team.leagues.map(l => l.name).join(', ')}
                      </p>
                    )}
                    {team.stadium && (
                      <p className="text-xs text-gray-500">
                        Stadium: {team.stadium}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="bg-dark-200 rounded-lg p-6 text-center">
          <p className="text-gray-400">No teams found</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;