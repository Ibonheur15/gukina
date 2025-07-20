import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FixturesPage from './pages/FixturesPage';
import LeagueTablePage from './pages/LeagueTablePage';
import TeamPage from './pages/TeamPage';
import MatchPage from './pages/MatchPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCountries from './pages/admin/AdminCountries';
import AdminLeagues from './pages/admin/AdminLeagues';
import AdminTeams from './pages/admin/AdminTeams';
import AdminMatches from './pages/admin/AdminMatches';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="fixtures" element={<FixturesPage />} />
        <Route path="league/:leagueId" element={<LeagueTablePage />} />
        <Route path="team/:teamId" element={<TeamPage />} />
        <Route path="match/:matchId" element={<MatchPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="countries" element={<AdminCountries />} />
        <Route path="leagues" element={<AdminLeagues />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="matches" element={<AdminMatches />} />
      </Route>
    </Routes>
  );
}

export default App;