import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FixturesPage from './pages/FixturesPage';
import LeagueTablePage from './pages/LeagueTablePage';
import TeamPage from './pages/TeamPage';
import MatchPage from './pages/MatchPage';
import SearchPage from './pages/SearchPage';
import NewsPage from './pages/NewsPage';
import SingleNewsPage from './pages/SingleNewsPage';
import CalendarPage from './pages/CalendarPage';
import CompetitionsPage from './pages/CompetitionsPage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCountries from './pages/admin/AdminCountries';
import AdminLeagues from './pages/admin/AdminLeagues';
import AdminTeams from './pages/admin/AdminTeams';
import AdminMatches from './pages/admin/AdminMatches';
import AdminLeagueStandings from './pages/admin/AdminLeagueStandings';
import MatchEventsPage from './pages/admin/MatchEventsPage';
import EventsListPage from './pages/admin/EventsListPage';
import AdminNews from './pages/admin/AdminNews';
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
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:newsId" element={<SingleNewsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="competitions" element={<CompetitionsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="matches" element={<MatchesPage />} />
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
        <Route path="leagues/:leagueId/standings" element={<AdminLeagueStandings />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="matches" element={<AdminMatches />} />
        <Route path="matches/:matchId/events" element={<MatchEventsPage />} />
        <Route path="events" element={<EventsListPage />} />
        <Route path="news" element={<AdminNews />} />
      </Route>
    </Routes>
  );
}

export default App;