import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage'));
const FixturesPage = lazy(() => import('./pages/FixturesPage'));
const LeagueTablePage = lazy(() => import('./pages/LeagueTablePage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const SingleMatchPage = lazy(() => import('./pages/SingleMatchPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const SingleNewsPage = lazy(() => import('./pages/SingleNewsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const CompetitionsPage = lazy(() => import('./pages/CompetitionsPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const StandaloneMatchesPage = lazy(() => import('./pages/StandaloneMatchesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Admin components
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCountries = lazy(() => import('./pages/admin/AdminCountries'));
const AdminLeagues = lazy(() => import('./pages/admin/AdminLeagues'));
const AdminTeams = lazy(() => import('./pages/admin/AdminTeams'));
const AdminMatches = lazy(() => import('./pages/admin/AdminMatches'));
const AdminLeagueStandings = lazy(() => import('./pages/admin/AdminLeagueStandings'));
const MatchEventsPage = lazy(() => import('./pages/admin/MatchEventsPage'));
const EventsListPage = lazy(() => import('./pages/admin/EventsListPage'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminStandaloneMatches = lazy(() => import('./pages/admin/AdminStandaloneMatches'));

function App() {
  const { loading } = useAuth();

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <HomePage />
            </Suspense>
          } />
          <Route path="fixtures" element={
            <Suspense fallback={<LoadingSpinner />}>
              <FixturesPage />
            </Suspense>
          } />
          <Route path="news" element={
            <Suspense fallback={<LoadingSpinner />}>
              <NewsPage />
            </Suspense>
          } />
          <Route path="news/:newsId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <SingleNewsPage />
            </Suspense>
          } />
          <Route path="calendar" element={
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarPage />
            </Suspense>
          } />
          <Route path="competitions" element={
            <Suspense fallback={<LoadingSpinner />}>
              <CompetitionsPage />
            </Suspense>
          } />
          <Route path="teams" element={
            <Suspense fallback={<LoadingSpinner />}>
              <TeamsPage />
            </Suspense>
          } />
          <Route path="matches" element={
            <Suspense fallback={<LoadingSpinner />}>
              <MatchesPage />
            </Suspense>
          } />
          <Route path="standalone-matches" element={
            <Suspense fallback={<LoadingSpinner />}>
              <StandaloneMatchesPage />
            </Suspense>
          } />
          <Route path="league/:leagueId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <LeagueTablePage />
            </Suspense>
          } />
          <Route path="team/:teamId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <TeamPage />
            </Suspense>
          } />
          <Route path="match/:matchId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <SingleMatchPage />
            </Suspense>
          } />
          <Route path="search" element={
            <Suspense fallback={<LoadingSpinner />}>
              <SearchPage />
            </Suspense>
          } />
          <Route path="login" element={
            <Suspense fallback={<LoadingSpinner />}>
              <LoginPage />
            </Suspense>
          } />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="countries" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminCountries />
            </Suspense>
          } />
          <Route path="leagues" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminLeagues />
            </Suspense>
          } />
          <Route path="leagues/:leagueId/standings" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminLeagueStandings />
            </Suspense>
          } />
          <Route path="teams" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminTeams />
            </Suspense>
          } />
          <Route path="matches" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminMatches />
            </Suspense>
          } />
          <Route path="matches/:matchId/events" element={
            <Suspense fallback={<LoadingSpinner />}>
              <MatchEventsPage />
            </Suspense>
          } />
          <Route path="events" element={
            <Suspense fallback={<LoadingSpinner />}>
              <EventsListPage />
            </Suspense>
          } />
          <Route path="news" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminNews />
            </Suspense>
          } />
          <Route path="standalone-matches" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AdminStandaloneMatches />
            </Suspense>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;