import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // Debug log to see what URL is being used

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// API services
export const countryService = {
  getAll: () => api.get('/countries'),
  getById: (id) => api.get(`/countries/${id}`),
  create: (data) => api.post('/countries', data),
  update: (id, data) => api.put(`/countries/${id}`, data),
  delete: (id) => api.delete(`/countries/${id}`),
};

export const leagueService = {
  getAll: () => api.get('/leagues'),
  getById: (id, season) => {
    const query = season ? `?season=${season}` : '';
    return api.get(`/leagues/${id}${query}`);
  },
  getByCountry: (countryId) => api.get(`/leagues/country/${countryId}`),
  getTopLeagues: (limit = 5) => api.get(`/leagues/top?limit=${limit}`),
  create: (data) => api.post('/leagues', data),
  update: (id, data) => api.put(`/leagues/${id}`, data),
  delete: (id) => api.delete(`/leagues/${id}`),
};

export const standingService = {
  getByLeague: (leagueId, season) => {
    const query = season ? `?season=${season}` : '';
    return api.get(`/standings/league/${leagueId}${query}`);
  },
  updateTeamStanding: (leagueId, teamId, data) => 
    api.put(`/standings/league/${leagueId}/team/${teamId}`, data),
  updateFromMatch: (matchId, data) => 
    api.post(`/standings/match/${matchId}`, data),
};

export const teamService = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  getByCountry: (countryId) => api.get(`/teams/country/${countryId}`),
  getByLeague: (leagueId) => api.get(`/teams/league/${leagueId}`),
  getPopular: (limit = 12) => api.get(`/teams/popular?limit=${limit}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
};

export const matchService = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  getLive: () => api.get('/matches/live'),
  getByDateRange: (startDate, endDate) => 
    api.get(`/matches/date?startDate=${startDate}&endDate=${endDate}`),
  getByDay: (day) => api.get(`/matches/date?day=${day}`),
  getByLeague: (leagueId) => api.get(`/matches/league/${leagueId}`),
  getByTeam: (teamId) => api.get(`/matches/team/${teamId}`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  addEvent: (id, data) => api.post(`/matches/${id}/events`, data),
  updateStatus: (id, status) => api.put(`/matches/${id}/status`, { status }),
  delete: (id) => api.delete(`/matches/${id}`),
};

export const seasonService = {
  getByLeague: (leagueId) => api.get(`/seasons/league/${leagueId}`),
};

export const fixService = {
  fixLeagueData: (leagueId) => api.get(`/fix/league/${leagueId}`),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  createAdmin: (userData) => api.post('/auth/admin', userData),
};

export default api;