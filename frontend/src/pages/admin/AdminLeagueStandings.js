import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leagueService, standingService } from '../../utils/api';

const AdminLeagueStandings = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [editingStanding, setEditingStanding] = useState(null);
  const [formData, setFormData] = useState({
    position: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch league data
        const leagueRes = await leagueService.getById(leagueId);
        setLeague(leagueRes.data.league);
        setTeams(leagueRes.data.teams || []);
        
        // Fetch standings
        try {
          const standingsRes = await standingService.getByLeague(leagueId, season);
          setStandings(standingsRes.data || []);
        } catch (standingErr) {
          console.log('No standings available for this season');
          setStandings([]);
          // Don't set error for standings - just show empty table
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching league data:', err);
        setError('Failed to load league data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [leagueId, season]);

  const handleSeasonChange = (e) => {
    setSeason(e.target.value);
  };

  const handleEditStanding = (standing) => {
    setEditingStanding(standing);
    setFormData({
      position: standing.position,
      played: standing.played,
      won: standing.won,
      drawn: standing.drawn,
      lost: standing.lost,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      points: standing.points
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value, 10) || 0
    });
  };

  const [selectedTeam, setSelectedTeam] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const teamId = editingStanding.team._id || selectedTeam;
      
      if (!teamId) {
        setError('Please select a team');
        return;
      }
      
      await standingService.updateTeamStanding(
        leagueId, 
        teamId, 
        {
          ...formData,
          season
        }
      );
      
      // Refresh standings
      try {
        const standingsRes = await standingService.getByLeague(leagueId, season);
        setStandings(standingsRes.data || []);
      } catch (err) {
        setStandings([]);
      }
      
      setEditingStanding(null);
      setSelectedTeam('');
    } catch (err) {
      console.error('Error updating standing:', err);
      setError('Failed to update standing');
    }
  };

  const handleCancel = () => {
    setEditingStanding(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md">
        {error || 'League not found'}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage League Standings: {league.name}</h1>
        <button
          onClick={() => navigate('/admin/leagues')}
          className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-400"
        >
          Back to Leagues
        </button>
      </div>
      
      {/* Season Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Season</label>
        <select
          value={season}
          onChange={handleSeasonChange}
          className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2"
        >
          {/* Generate options for current year and 5 years back */}
          {Array.from({ length: 6 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year.toString()}>
                {year}/{(year + 1).toString().slice(-2)}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Add New Standing Button */}
      <div className="mb-6">
        <button
          onClick={() => setEditingStanding({ team: {}, position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] })}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Add New Standing
        </button>
      </div>
      
      {/* Standings Table */}
      <div className="bg-dark-200 rounded-lg overflow-hidden mb-6">
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
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {standings.length > 0 ? (
                standings.map((standing) => (
                  <tr key={standing._id} className="border-t border-dark-300 hover:bg-dark-300">
                    <td className="px-4 py-3 text-center">{standing.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {standing.team.logo ? (
                          <img src={standing.team.logo} alt={standing.team.name} className="w-6 h-6 mr-2 object-contain" />
                        ) : (
                          <div className="w-6 h-6 bg-dark-400 rounded-full mr-2 flex items-center justify-center">
                            <span className="text-xs">{standing.team.shortName.substring(0, 2)}</span>
                          </div>
                        )}
                        <span>{standing.team.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{standing.played}</td>
                    <td className="px-4 py-3 text-center">{standing.won}</td>
                    <td className="px-4 py-3 text-center">{standing.drawn}</td>
                    <td className="px-4 py-3 text-center">{standing.lost}</td>
                    <td className="px-4 py-3 text-center">{standing.goalsFor}</td>
                    <td className="px-4 py-3 text-center">{standing.goalsAgainst}</td>
                    <td className="px-4 py-3 text-center">{standing.goalsFor - standing.goalsAgainst}</td>
                    <td className="px-4 py-3 text-center font-bold">{standing.points}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditStanding(standing)}
                        className="text-primary hover:text-primary-dark"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="px-4 py-6 text-center text-gray-400">
                    No standings data available for this season
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Edit Standing Form */}
      {editingStanding && (
        <div className="bg-dark-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingStanding.team._id ? `Edit Standing: ${editingStanding.team.name}` : 'Add New Standing'}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Team selector for new standings */}
            {!editingStanding.team._id && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Team</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input
                  type="number"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Played</label>
                <input
                  type="number"
                  name="played"
                  value={formData.played}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Won</label>
                <input
                  type="number"
                  name="won"
                  value={formData.won}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Drawn</label>
                <input
                  type="number"
                  name="drawn"
                  value={formData.drawn}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lost</label>
                <input
                  type="number"
                  name="lost"
                  value={formData.lost}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Goals For</label>
                <input
                  type="number"
                  name="goalsFor"
                  value={formData.goalsFor}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Goals Against</label>
                <input
                  type="number"
                  name="goalsAgainst"
                  value={formData.goalsAgainst}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="bg-dark-300 border border-dark-400 rounded-md px-3 py-2 w-full"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminLeagueStandings;