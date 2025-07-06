import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/tickets';
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
  TrendingUp
} from 'lucide-react';

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
    pendingApproval: 0
  });

  // Load tickets based on user role
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        let ticketsData;
        
        if (user?.role === 'manager' || user?.role === 'digital_team') {
          // Managers and digital team see all tickets
          ticketsData = await ticketsService.getAllTickets();
        } else {
          // General users see only their tickets
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

  // Calculate statistics from tickets
  const calculateStats = (ticketsData) => {
    const stats = {
      total: ticketsData.length,
      open: ticketsData.filter(t => t.status === 'Open').length,
      inProgress: ticketsData.filter(t => t.status === 'In Progress').length,
      resolved: ticketsData.filter(t => t.status === 'Resolved').length,
      urgent: ticketsData.filter(t => t.urgency === 'High').length,
      pendingApproval: ticketsData.filter(t => t.status === 'Pending Approval').length
    };
    setStats(stats);
  };

  // Get recent tickets (last 5)
  const getRecentTickets = () => {
    return tickets
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  // Get role-specific stats cards
  const getStatsCards = () => {
    const baseCards = [
      {
        name: 'Total Tickets',
        value: stats.total,
        icon: Ticket,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      }
    ];

    if (user?.role === 'manager') {
      return [
        ...baseCards,
        {
          name: 'Pending Approval',
          value: stats.pendingApproval,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        },
        {
          name: 'High Priority',
          value: stats.urgent,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        },
        {
          name: 'Resolved Today',
          value: stats.resolved,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      ];
    } else if (user?.role === 'digital_team') {
      return [
        ...baseCards,
        {
          name: 'Open Tickets',
          value: stats.open,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          name: 'In Progress',
          value: stats.inProgress,
          icon: TrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          name: 'Urgent',
          value: stats.urgent,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      ];
    } else {
      return [
        ...baseCards,
        {
          name: 'Open',
          value: stats.open,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          name: 'In Progress',
          value: stats.inProgress,
          icon: TrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          name: 'Resolved',
          value: stats.resolved,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      ];
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'manager' ? 'Manager Dashboard' :
                 user?.role === 'digital_team' ? 'Support Team Dashboard' :
                 'My Dashboard'}
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 capitalize">
                Role: {user?.role?.replace('_', ' ')}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatsCards().map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/create-ticket')}
                className="w-full text-left px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Ticket
              </button>
              
              <button
                onClick={() => navigate('/my-tickets')}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
              >
                <Ticket className="w-4 h-4 mr-2" />
                {user?.role === 'manager' || user?.role === 'digital_team' ? 'Manage All Tickets' : 'View My Tickets'}
              </button>

              {user?.role === 'manager' && stats.pendingApproval > 0 && (
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {stats.pendingApproval} Tickets Need Approval
                </button>
              )}

              {user?.role === 'digital_team' && stats.urgent > 0 && (
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {stats.urgent} Urgent Tickets
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
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
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.ticket_number} • {formatDate(ticket.created_at)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
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
                    className="text-blue-600 text-sm hover:text-blue-700 mt-1"
                  >
                    Create your first ticket
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Role-specific Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {user?.role === 'manager' ? 'Management Overview' :
               user?.role === 'digital_team' ? 'Team Dashboard' :
               'Your Activity'}
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
                  <span className="text-sm text-gray-600">Resolved this week</span>
                  <span className="font-semibold text-green-600">{stats.resolved}</span>
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
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-600">{stats.resolved}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Users className="w-6 h-6 text-blue-600 mt-1" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                {user?.role === 'manager' ? 'Manager Capabilities' :
                 user?.role === 'digital_team' ? 'Support Team Features' :
                 'Available Features'}
              </h4>
              <div className="mt-2 text-sm text-blue-800">
                {user?.role === 'manager' ? (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Approve pending tickets from team members</li>
                    <li>View comprehensive analytics and reports</li>
                    <li>Assign tickets to appropriate team members</li>
                    <li>Monitor team performance and response times</li>
                  </ul>
                ) : user?.role === 'digital_team' ? (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Work on tickets assigned to you or available queue</li>
                    <li>Update ticket status and add resolution notes</li>
                    <li>Self-raised tickets require manager approval</li>
                    <li>Prioritize based on urgency and business impact</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Create detailed support requests with attachments</li>
                    <li>Track real-time progress of your tickets</li>
                    <li>Receive email notifications on status updates</li>
                    <li>Access knowledge base and self-help resources</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;