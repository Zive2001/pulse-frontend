import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Ticket, 
  Plus, 
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const LeftNavigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        label: 'Dashboard'
      },
      {
        name: 'Tickets',
        path: '/my-tickets',
        icon: Ticket,
        label: user?.role === 'manager' || user?.role === 'digital_team' ? 'All Tickets' : 'My Tickets'
      },
      {
        name: 'Create',
        path: '/create-ticket',
        icon: Plus,
        label: 'Create Ticket'
      }
    ];

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false); // Close mobile menu after navigation
  };

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Top Padding for Content */}
      <div className="md:hidden h-16 w-full"></div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Left Navigation */}
      <div className="hidden md:block">
        <div 
          className={`fixed left-6 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ease-in-out ${
            isExpanded ? 'w-48' : 'w-16'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3">
            {/* Toggle Button */}
            <div className="flex justify-end mb-3">
              <button
                onClick={toggleExpanded}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              >
                {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation Items */}
            <div className="space-y-2 mb-4">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center transition-all duration-200 rounded-xl p-3 ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${isExpanded ? 'justify-start' : 'justify-center'}`}
                  title={!isExpanded ? item.label : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4"></div>

            {/* User Section */}
            <div className="space-y-2">
              {/* User Info */}
              <div 
                className={`flex items-center p-3 rounded-xl bg-gray-50 ${
                  isExpanded ? 'justify-start' : 'justify-center'
                }`}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                {isExpanded && (
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm truncate">{user?.name}</div>
                    <div className="text-gray-500 text-xs capitalize truncate">
                      {user?.role?.replace('_', ' ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center p-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 ${
                  isExpanded ? 'justify-start' : 'justify-center'
                }`}
                title={!isExpanded ? 'Logout' : ''}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="ml-3 font-medium">Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Side Navigation */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="w-80 bg-white h-full shadow-xl">
          <div className="p-6">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-sm text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <div className="space-y-2 mb-8">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="ml-4 font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Logout */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-4 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              >
                <LogOut className="w-6 h-6" />
                <span className="ml-4 font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftNavigation;