import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leagueService, teamService, newsService } from '../utils/api';
import { format } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const Sidebar = ({ isOpen, onClose }) => {
  const [topLeagues, setTopLeagues] = useState([]);
  const [regions, setRegions] = useState([]);
  const [popularTeams, setPopularTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState([]);
  const [openSections, setOpenSections] = useState({
    competitions: true, // Open by default
    regions: false,
    teams: false,
    news: true // Open by default
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch top leagues (using priority field)
        const topLeaguesRes = await leagueService.getTopLeagues(8);
        setTopLeagues(topLeaguesRes.data || []);
        
        // Fetch all leagues for regions
        const leaguesRes = await leagueService.getAll();
        const leagues = leaguesRes.data || [];
        
        // Group leagues by country/region
        const regionMap = {};
        leagues.forEach(league => {
          if (league.country) {
            const countryId = league.country._id;
            const countryName = league.country.name;
            
            if (!regionMap[countryId]) {
              regionMap[countryId] = {
                id: countryId,
                name: countryName,
                flag: league.country.flag || null,
                leagues: []
              };
            }
            
            regionMap[countryId].leagues.push({
              id: league._id,
              name: league.name,
              logo: league.logo || null
            });
          }
        });
        
        // Sort regions by number of leagues (most leagues first)
        const sortedRegions = Object.values(regionMap)
          .sort((a, b) => b.leagues.length - a.leagues.length)
          .slice(0, 10);
        
        setRegions(sortedRegions);
        
        // Fetch popular teams
        const teamsRes = await teamService.getPopular(12);
        setPopularTeams(teamsRes.data || []);
        
        // Fetch latest news
        try {
          const newsRes = await newsService.getLatest(3);
          setLatestNews(newsRes.data || []);
        } catch (err) {
          console.error('Error fetching latest news:', err);
          setLatestNews([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`sidebar bg-dark-200 shadow-lg z-40 
      lg:block lg:w-64 lg:static lg:transform-none lg:h-auto lg:z-0
      ${isOpen ? 'fixed top-0 right-0 h-full w-64 transform translate-x-0' : 'fixed top-0 right-0 h-full w-64 transform translate-x-full'}
      transition-transform duration-300 ease-in-out`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Explore</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Top Competitions */}
            <div className="mb-6">
              <button 
                onClick={() => toggleSection('competitions')} 
                className="flex justify-between items-center w-full text-left mb-2"
              >
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Top Competitions</h3>
                {openSections.competitions ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              {openSections.competitions && (
                <ul className="space-y-2">
                  {topLeagues.length > 0 ? (
                    topLeagues.map(league => (
                      <li key={league._id}>
                        <Link 
                          to={`/league/${league._id}`}
                          className="flex items-center hover:bg-dark-300 p-2 rounded-md"
                          onClick={onClose}
                        >
                          {league.logo ? (
                            <img src={league.logo} alt={league.name} className="w-6 h-6 mr-2 object-contain" />
                          ) : (
                            <div className="w-6 h-6 bg-dark-300 rounded-full mr-2 flex items-center justify-center">
                              <span className="text-xs">{league.name.substring(0, 2)}</span>
                            </div>
                          )}
                          <span className="text-sm">{league.name}</span>
                          {league.country && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({league.country.name})
                            </span>
                          )}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 p-2">No competitions available</li>
                  )}
                  <li>
                    <Link 
                      to="/standalone-matches"
                      className="flex items-center hover:bg-dark-300 p-2 rounded-md text-purple-400"
                      onClick={onClose}
                    >
                      <div className="w-6 h-6 bg-purple-900 bg-opacity-30 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-xs">SM</span>
                      </div>
                      <span className="text-sm">Standalone Matches</span>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            
            {/* Regions */}
            <div className="mb-6">
              <button 
                onClick={() => toggleSection('regions')} 
                className="flex justify-between items-center w-full text-left mb-2"
              >
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Regions</h3>
                {openSections.regions ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              {openSections.regions && (
                <ul className="space-y-3">
                  {regions.length > 0 ? (
                    regions.map(region => (
                      <li key={region.id} className="mb-2">
                        <div className="flex items-center mb-1 bg-dark-300 p-1 rounded">
                          {region.flag ? (
                            <img src={region.flag} alt={region.name} className="w-4 h-3 mr-2" />
                          ) : (
                            <div className="w-4 h-3 bg-dark-400 mr-2"></div>
                          )}
                          <span className="font-medium text-sm">{region.name}</span>
                          <span className="ml-1 text-xs text-gray-500">({region.leagues.length})</span>
                        </div>
                        <ul className="pl-4 space-y-1 border-l border-dark-400 ml-2">
                          {region.leagues.slice(0, 4).map(league => (
                            <li key={league.id}>
                              <Link 
                                to={`/league/${league.id}`}
                                className="text-xs text-gray-400 hover:text-white flex items-center py-1"
                                onClick={onClose}
                              >
                                {league.logo ? (
                                  <img src={league.logo} alt={league.name} className="w-4 h-4 mr-1 object-contain" />
                                ) : null}
                                {league.name}
                              </Link>
                            </li>
                          ))}
                          {region.leagues.length > 4 && (
                            <li>
                              <Link 
                                to={`/competitions?country=${region.id}`}
                                className="text-xs text-primary hover:underline"
                                onClick={onClose}
                              >
                                + {region.leagues.length - 4} more
                              </Link>
                            </li>
                          )}
                        </ul>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 p-2">No regions available</li>
                  )}
                </ul>
              )}
            </div>
            
            {/* Teams */}
            <div className="mb-6">
              <button 
                onClick={() => toggleSection('teams')} 
                className="flex justify-between items-center w-full text-left mb-2"
              >
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Popular Teams</h3>
                {openSections.teams ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              {openSections.teams && (
                <ul className="space-y-2">
                  {popularTeams.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {popularTeams.map(team => (
                        <li key={team._id}>
                          <Link 
                            to={`/team/${team._id}`}
                            className="flex flex-col items-center hover:bg-dark-300 p-2 rounded-md text-center"
                            onClick={onClose}
                          >
                            {team.logo ? (
                              <img src={team.logo} alt={team.name} className="w-8 h-8 mb-1 object-contain" />
                            ) : (
                              <div className="w-8 h-8 bg-dark-300 rounded-full mb-1 flex items-center justify-center">
                                <span className="text-xs">{team.shortName?.substring(0, 2) || team.name.substring(0, 2)}</span>
                              </div>
                            )}
                            <span className="text-xs truncate w-full">{team.name}</span>
                            {team.league && (
                              <span className="text-xs text-gray-500 truncate w-full">{team.league.name}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </div>
                  ) : (
                    <li className="text-sm text-gray-500 p-2">No teams available</li>
                  )}
                </ul>
              )}
            </div>
            
            {/* Latest News */}
            <div>
              <button 
                onClick={() => toggleSection('news')} 
                className="flex justify-between items-center w-full text-left mb-2"
              >
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Latest News</h3>
                {openSections.news ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              {openSections.news && (
                <ul className="space-y-3">
                  {latestNews.length > 0 ? (
                    latestNews.map(news => (
                      <li key={news._id} className="border-b border-dark-300 pb-3 last:border-0">
                        <Link 
                          to={`/news/${news._id}`}
                          className="hover:text-primary"
                          onClick={onClose}
                        >
                          {news.image && (
                            <img 
                              src={news.image} 
                              alt={news.title} 
                              className="w-full h-24 object-cover rounded-md mb-2" 
                            />
                          )}
                          <h4 className="text-sm font-medium line-clamp-2">{news.title}</h4>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <span>{format(new Date(news.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 p-2">No news available</li>
                  )}
                  <li>
                    <Link 
                      to="/news"
                      className="text-primary text-sm hover:underline flex items-center"
                      onClick={onClose}
                    >
                      View all news
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;