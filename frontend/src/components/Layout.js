import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const Layout = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [activeSport, setActiveSport] = useState('football');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sports = [
    { id: 'football', name: 'Football' },
    { id: 'basketball', name: 'Basketball', comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-dark-100 text-white">
      {/* Top Navigation - Fixed */}
      <header className="bg-dark-200 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">Gukina</span>
            </Link>

            {/* Main Nav */}
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Scores
              </NavLink>
              <NavLink to="/news" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                News
              </NavLink>
              <NavLink to="/matches" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Matches
              </NavLink>
              <NavLink to="/competitions" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Competitions
              </NavLink>
              <NavLink to="/teams" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Teams
              </NavLink>
              <NavLink to="/calendar" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Calendar
              </NavLink>
            </nav>

            {/* Mobile News Icon */}
            <div className="md:hidden">
              <NavLink to="/news" className="flex items-center p-2 space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span className="text-sm">News</span>
              </NavLink>
            </div>

            {/* Auth Links */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="nav-link">
                      Admin
                    </Link>
                  )}
                  <button onClick={logout} className="nav-link">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-dark-300">
              <NavLink to="/" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Scores
              </NavLink>
              <NavLink to="/news" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                News
              </NavLink>
              <NavLink to="/matches" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Matches
              </NavLink>
              <NavLink to="/competitions" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Competitions
              </NavLink>
              <NavLink to="/teams" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Teams
              </NavLink>
              <NavLink to="/calendar" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Calendar
              </NavLink>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block py-2 w-full text-left">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          )}


        </div>
      </header>

      {/* Sports Filter Section */}
      <div className="bg-dark-200 border-t border-dark-300 mt-12">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto py-3">
            <div className="flex space-x-4">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    activeSport === sport.id
                      ? 'bg-primary text-white'
                      : 'bg-dark-300 text-gray-300 hover:bg-dark-400'
                  }`}
                  onClick={() => setActiveSport(sport.id)}
                >
                  {sport.name}
                  {sport.comingSoon && (
                    <span className="ml-1 px-1 py-0.5 bg-yellow-900 bg-opacity-30 text-yellow-500 text-xs rounded">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar for large screens */}
          <div className="hidden lg:block lg:w-64 lg:mr-6">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Sidebar Toggle Button - Only on mobile */}
      <div className="lg:hidden">
        <SidebarToggle onClick={() => setSidebarOpen(true)} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Overlay when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-dark-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-primary">Gukina</span>
              <p className="text-sm text-gray-400 mt-1">African Sports Platform</p>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Gukina. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;