import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/tickets';
import LottieIcon from '../components/LottieIcon';
import {
  Plus,
  Ticket,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Shield,
  Database,
} from 'lucide-react';

// Import your Lottie animation files
import morningAnimation from '../assets/animations/morning.json';
import afternoonAnimation from '../assets/animations/afternoon.json';
import eveningAnimation from '../assets/animations/evening.json';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
    pendingApproval: 0,
    resolvedToday: 0,
    openUrgent: 0, // New stat for open urgent tickets
  });

  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        let ticketsData;
        if (user?.role === 'manager' || user?.role === 'digital_team' || user?.role === 'admin') {
          ticketsData = await ticketsService.getAllTickets();
        } else {
          ticketsData = await ticketsService.getMyTickets();
        }
        setTickets(ticketsData);
        calculateStats(ticketsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Calculate statistics
  const calculateStats = (ticketsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (dateStr) => {
      const ticketDate = new Date(dateStr);
      return (
        ticketDate.getDate() === today.getDate() &&
        ticketDate.getMonth() === today.getMonth() &&
        ticketDate.getFullYear() === today.getFullYear()
      );
    };

    const stats = {
      total: ticketsData.length,
      open: ticketsData.filter((t) => t.status === 'Open').length,
      inProgress: ticketsData.filter((t) => t.status === 'In Progress').length,
      resolved: ticketsData.filter((t) => t.status === 'Resolved').length,
      resolvedToday: ticketsData.filter(
        (t) => t.status === 'Resolved' && isToday(t.updated_at || t.resolved_at)
      ).length,
      urgent: ticketsData.filter((t) => t.urgency === 'High').length,
      pendingApproval: ticketsData.filter((t) => t.status === 'Pending Approval').length,
      openUrgent: ticketsData.filter((t) => t.urgency === 'High' && t.status === 'Open').length, // New calculation
    };

    setStats(stats);

    // Set notification count based on role
    if (user?.role === 'manager') {
      setNotificationCount(stats.pendingApproval);
    } else if (user?.role === 'digital_team' || user?.role === 'admin') {
      setNotificationCount(stats.openUrgent); // Changed from stats.urgent to stats.openUrgent
    } else {
      setNotificationCount(stats.open + stats.inProgress);
    }
  };

  // Get recent tickets
  const getRecentTickets = () => {
    return tickets
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  // Get time-based greeting with Lottie animations
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return { 
        text: 'Good morning', 
        animation: morningAnimation, 
        color: 'text-orange-500' 
      };
    } else if (currentHour < 17) {
      return { 
        text: 'Good afternoon', 
        animation: afternoonAnimation, 
        color: 'text-yellow-500' 
      };
    } else {
      return { 
        text: 'Good evening', 
        animation: eveningAnimation, 
        color: 'text-blue-500' 
      };
    }
  };

  // Get filtered notifications based on role
  const getNotificationTickets = () => {
    if (user?.role === 'manager') {
      return tickets.filter(t => t.status === 'Pending Approval');
    } else if (user?.role === 'digital_team' || user?.role === 'admin') {
      return tickets.filter(t => t.urgency === 'High' && t.status === 'Open'); // Changed to filter for open urgent tickets only
    } else {
      return tickets.filter(t => ['Open', 'In Progress'].includes(t.status));
    }
  };

  const notificationTickets = getNotificationTickets();

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Toggle notification panel
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Pending Approval': 'bg-orange-100 text-orange-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role-specific stats cards
  const getStatsCards = () => {
    const baseCards = [
      {
        name: 'Total Tickets',
        value: stats.total,
        icon: Ticket,
        color: 'text-blue-600'
      }
    ];

    if (user?.role === 'manager') {
      return [
        ...baseCards,
        {
          name: 'Pending Approval',
          value: stats.pendingApproval,
          icon: Clock,
          color: 'text-orange-600'
        },
        {
          name: 'High Priority',
          value: stats.urgent,
          icon: AlertTriangle,
          color: 'text-red-600'
        },
        {
          name: 'Resolved Today',
          value: stats.resolvedToday,
          icon: CheckCircle,
          color: 'text-green-600'
        }
      ];
    } else if (user?.role === 'digital_team' || user?.role === 'admin') {
      return [
        ...baseCards,
        {
          name: 'Open Tickets',
          value: stats.open,
          icon: Clock,
          color: 'text-yellow-600'
        },
        {
          name: 'In Progress',
          value: stats.inProgress,
          icon: TrendingUp,
          color: 'text-blue-600'
        },
        {
          name: 'Urgent',
          value: stats.urgent,
          icon: AlertTriangle,
          color: 'text-red-600'
        }
      ];
    } else {
      return [
        ...baseCards,
        {
          name: 'Open',
          value: stats.open,
          icon: Clock,
          color: 'text-yellow-600'
        },
        {
          name: 'In Progress',
          value: stats.inProgress,
          icon: TrendingUp,
          color: 'text-blue-600'
        },
        {
          name: 'Resolved',
          value: stats.resolved,
          icon: CheckCircle,
          color: 'text-green-600'
        }
      ];
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user?.role === 'manager'
                    ? 'Manager Dashboard'
                    : user?.role === 'digital_team'
                    ? 'Support Dashboard'
                    : user?.role === 'admin'
                    ? 'Admin Dashboard'
                    : 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>

              {/* Admin Button in Header */}
              {isAdmin() && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Admin Panel"
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}

              <div className="relative notification-dropdown">
                <button
                  onClick={handleBellClick}
                  className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                  aria-expanded={showNotifications}
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200 max-h-96 overflow-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-sm text-gray-700">
                        {user?.role === 'manager' ? 'Pending Approvals' :
                         user?.role === 'digital_team' || user?.role === 'admin' ? 'Open Urgent Tickets' : 'Tasks Needing Attention'}
                      </h3>
                    </div>

                    {notificationTickets.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No pending tasks
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {notificationTickets.map((ticket) => (
                          <li
                            key={ticket.id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(`/tickets/${ticket.id}`);
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                                <p className="text-xs text-gray-500">{ticket.ticket_number}</p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Created: {formatDate(ticket.created_at)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="p-2 border-t border-gray-200 text-right">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/my-tickets');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="ml-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Message with Lottie Animation */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <LottieIcon 
              animationData={getGreeting().animation} 
              width={40} 
              height={40}
              className="flex-shrink-0"
            />
            <h2 className="text-lg font-medium text-gray-900">
              {getGreeting().text}, {user?.name}!
            </h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Here's what's happening with your tickets today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {getStatsCards().map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/create-ticket')}
                className="w-full text-left px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Ticket
              </button>
              <button
                onClick={() => navigate('/my-tickets')}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
              >
                <Ticket className="w-4 h-4 mr-2" />
                {user?.role === 'manager' || user?.role === 'digital_team' || user?.role === 'admin'
                  ? 'Manage All Tickets'
                  : 'View My Tickets'}
              </button>
              
              {/* Admin Panel Button in Quick Actions */}
              {isAdmin() && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors flex items-center"
                  style={{ backgroundColor: '#2a9d8f' }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </button>
              )}
              
              {user?.role === 'manager' && stats.pendingApproval > 0 && (
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {stats.pendingApproval} Tickets Need Approval
                </button>
              )}
              {(user?.role === 'digital_team' || user?.role === 'admin') && stats.openUrgent > 0 && (
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {stats.openUrgent} Open Urgent Tickets
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Tickets
            </h3>
            <div className="space-y-3">
              {getRecentTickets().length > 0 ? (
                getRecentTickets().map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                        <p className="text-xs text-gray-500">
                          {ticket.ticket_number} • {formatDate(ticket.created_at)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        ticket.status
                      )}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tickets yet</p>
                  <button
                    onClick={() => navigate('/create-ticket')}
                    className="text-gray-900 text-sm hover:text-gray-700 mt-1"
                  >
                    Create your first ticket
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Role-specific Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {user?.role === 'manager'
                ? 'Management Overview'
                : user?.role === 'digital_team'
                ? 'Support Dashboard'
                : user?.role === 'admin'
                ? 'System Overview'
                : 'Your Activity'}
            </h3>
            {user?.role === 'manager' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tickets requiring approval</span>
                  <span className="font-semibold text-orange-600">{stats.pendingApproval}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High priority tickets</span>
                  <span className="font-semibold text-red-600">{stats.urgent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resolved today</span>
                  <span className="font-semibold text-green-600">{stats.resolvedToday}</span>
                </div>
              </div>
            ) : user?.role === 'digital_team' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Open tickets</span>
                  <span className="font-semibold text-blue-600">{stats.open}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In progress</span>
                  <span className="font-semibold text-yellow-600">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Urgent tickets</span>
                  <span className="font-semibold text-red-600">{stats.urgent}</span>
                </div>
              </div>
            ) : user?.role === 'admin' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total system tickets</span>
                  <span className="font-semibold text-blue-600">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending approval</span>
                  <span className="font-semibold text-orange-600">{stats.pendingApproval}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Urgent tickets</span>
                  <span className="font-semibold text-red-600">{stats.urgent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resolved today</span>
                  <span className="font-semibold text-green-600">{stats.resolvedToday}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center"
                  >
                    <Database className="w-4 h-4 mr-1" />
                    System Management
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">My open tickets</span>
                  <span className="font-semibold text-blue-600">{stats.open}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In progress</span>
                  <span className="font-semibold text-yellow-600">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm   text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-700">{stats.resolved}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;