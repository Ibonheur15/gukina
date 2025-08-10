import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-100 text-white">
      {/* Header */}
      <header className="bg-dark-200 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                className="mr-4 md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/admin" className="flex items-center">
                <span className="text-xl font-bold text-primary">Gukina Admin</span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="nav-link">
                View Site
              </Link>
              <button onClick={logout} className="nav-link">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className={`
          md:w-64 md:block md:static md:h-auto
          ${sidebarOpen ? 'block fixed inset-0 z-50 bg-dark-100 pt-16' : 'hidden'}
        `}>
          <div className="bg-dark-200 rounded-lg p-4 sticky top-6">
            <nav className="space-y-1">
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/countries" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'}`
                }
              >
                Countries
              </NavLink>
              <NavLink 
                to="/admin/leagues" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'}`
                }
              >
                Leagues
              </NavLink>
              <NavLink 
                to="/admin/teams" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'}`
                }
              >
                Teams
              </NavLink>
              <NavLink 
                to="/admin/matches" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'}`
                }
              >
                Matches
              </NavLink>
              <NavLink 
                to="/admin/standalone-matches" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'} text-purple-400`
                }
              >
                Standalone Matches
              </NavLink>
              <NavLink 
                to="/admin/events" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'}`
                }
              >
                Events
              </NavLink>
              <NavLink 
                to="/admin/news" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive ? 'bg-primary text-white' : 'hover:bg-dark-300'}`
                }
              >
                News
              </NavLink>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;