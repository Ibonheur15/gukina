import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  getById: (id) => api.get(`/leagues/${id}`),
  getByCountry: (countryId) => api.get(`/leagues/country/${countryId}`),
  create: (data) => api.post('/leagues', data),
  update: (id, data) => api.put(`/leagues/${id}`, data),
  delete: (id) => api.delete(`/leagues/${id}`),
};

export const teamService = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  getByCountry: (countryId) => api.get(`/teams/country/${countryId}`),
  getByLeague: (leagueId) => api.get(`/teams/league/${leagueId}`),
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
  getByLeague: (leagueId) => api.get(`/matches/league/${leagueId}`),
  getByTeam: (teamId) => api.get(`/matches/team/${teamId}`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  addEvent: (id, data) => api.post(`/matches/${id}/events`, data),
  updateStatus: (id, status) => api.put(`/matches/${id}/status`, { status }),
  delete: (id) => api.delete(`/matches/${id}`),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  createAdmin: (userData) => api.post('/auth/admin', userData),
};

export default api;