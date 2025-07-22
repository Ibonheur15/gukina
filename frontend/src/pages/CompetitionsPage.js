import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LeagueCard from '../components/LeagueCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CompetitionsPage = () => {
  const { isAdmin } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCountry, setActiveCountry] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all leagues
        const leaguesRes = await axios.get(`${API_URL}/leagues`);
        setLeagues(leaguesRes.data);
        
        // Fetch all countries
        const countriesRes = await axios.get(`${API_URL}/countries`);
        setCountries(countriesRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load competitions');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCountryFilter = async (countryId) => {
    try {
      setLoading(true);
      setActiveCountry(countryId);
      
      if (countryId === 'all') {
        const res = await axios.get(`${API_URL}/leagues`);
        setLeagues(res.data);
      } else {
        const res = await axios.get(`${API_URL}/leagues/country/${countryId}`);
        setLeagues(res.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error filtering leagues:', err);
      setError('Failed to filter competitions');
      setLoading(false);
    }
  };

  // Group leagues by country
  const groupLeaguesByCountry = () => {
    const grouped = {};
    
    leagues.forEach(league => {
      if (!league.country) return;
      
      const countryId = league.country._id;
      const countryName = league.country.name;
      
      if (!grouped[countryId]) {
        grouped[countryId] = {
          name: countryName,
          flag: league.country.flag,
          leagues: []
        };
      }
      
      grouped[countryId].leagues.push(league);
    });
    
    return Object.values(grouped);
  };

  const leaguesByCountry = groupLeaguesByCountry();

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
        <h1 className="text-2xl font-bold">Competitions</h1>
        
        {isAdmin && (
          <Link 
            to="/admin/leagues" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Manage Competitions
          </Link>
        )}
      </div>
      
      {/* Country Filter */}
      <div className="flex items-center mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${
            activeCountry === 'all' ? 'bg-primary text-white' : 'bg-dark-300 hover:bg-dark-400'
          }`}
          onClick={() => handleCountryFilter('all')}
        >
          All Countries
        </button>
        
        {countries.map((country) => (
          <button
            key={country._id}
            className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap flex items-center ${
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
      
      {/* Leagues List */}
      {leaguesByCountry.length > 0 ? (
        leaguesByCountry.map((country) => (
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {country.leagues.map((league) => (
                <LeagueCard key={league._id} league={league} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-dark-200 rounded-lg p-6 text-center">
          <p className="text-gray-400">No competitions found</p>
          {isAdmin && (
            <div className="mt-4">
              <Link 
                to="/admin/leagues" 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Create Competition
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitionsPage;