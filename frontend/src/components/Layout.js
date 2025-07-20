import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [activeSport, setActiveSport] = useState('football');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sports = [
    { id: 'football', name: 'Football' },
    { id: 'basketball', name: 'Basketball' },
    { id: 'tennis', name: 'Tennis' },
    { id: 'cricket', name: 'Cricket' },
    { id: 'hockey', name: 'Hockey' },
  ];

  return (
    <div className="min-h-screen bg-dark-100 text-white">
      {/* Top Navigation */}
      <header className="bg-dark-200 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Gukina</span>
            </Link>

            {/* Main Nav */}
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Scores
              </NavLink>
              <NavLink to="/fixtures" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Fixtures
              </NavLink>
              <NavLink to="/favorites" className={({ isActive }) => 
                isActive ? 'nav-link active' : 'nav-link'
              }>
                Favorites
              </NavLink>
            </nav>

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
              className="md:hidden"
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
              <NavLink to="/fixtures" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Fixtures
              </NavLink>
              <NavLink to="/favorites" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Favorites
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

          {/* Sports Selector */}
          <div className="overflow-x-auto py-2">
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
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
            <div className="bg-dark-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Regions</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-sm hover:text-primary">Rwanda</a></li>
                <li><a href="#" className="text-sm hover:text-primary">Kenya</a></li>
                <li><a href="#" className="text-sm hover:text-primary">Nigeria</a></li>
                <li><a href="#" className="text-sm hover:text-primary">CAF</a></li>
              </ul>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Competitions</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-sm hover:text-primary">Rwanda Premier League</a></li>
                <li><a href="#" className="text-sm hover:text-primary">Kenya Premier League</a></li>
                <li><a href="#" className="text-sm hover:text-primary">Nigeria Professional League</a></li>
                <li><a href="#" className="text-sm hover:text-primary">CAF Champions League</a></li>
              </ul>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Teams</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-sm hover:text-primary">APR FC</a></li>
                <li><a href="#" className="text-sm hover:text-primary">Gor Mahia</a></li>
                <li><a href="#" className="text-sm hover:text-primary">Enyimba FC</a></li>
                <li><a href="#" className="text-sm hover:text-primary">Al Ahly</a></li>
              </ul>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </main>

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