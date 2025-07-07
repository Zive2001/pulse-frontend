import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  User,
  Calendar,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/tickets';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastUtils';

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // Load tickets based on user role
  useEffect(() => {
    const loadTickets = async () => {
      let loadingToastId;
      
      try {
        setLoading(true);
        loadingToastId = showLoadingToast('Loading tickets...');
        
        let ticketsData;
        
        if (user?.role === 'manager' || user?.role === 'digital_team') {
          // Managers and digital team see all tickets
          ticketsData = await ticketsService.getAllTickets();
        } else {
          // General users see only their tickets
          ticketsData = await ticketsService.getMyTickets();
        }
        
        setTickets(ticketsData);
        
        // Just dismiss loading toast, no success message
        dismissToast(loadingToastId);
        
      } catch (error) {
        console.error('Failed to load tickets:', error);
        
        // Dismiss loading toast
        if (loadingToastId) {
          dismissToast(loadingToastId);
        }
        
        showErrorToast(
          'Failed to load tickets. Please refresh the page and try again.',
          { duration: 5000 }
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadTickets();
    }
  }, [user?.role]);

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || ticket.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      'Open': 'bg-blue-50 text-blue-700',
      'In Progress': 'bg-orange-50 text-orange-700',
      'Pending Approval': 'bg-purple-50 text-purple-700',
      'Resolved': 'bg-green-50 text-green-700',
      'Closed': 'bg-gray-50 text-gray-600'
    };
    return badges[status] || 'bg-gray-50 text-gray-600';
  };

  // Get urgency badge styling
  const getUrgencyBadge = (urgency) => {
    const badges = {
      'High': 'bg-red-50 text-red-700',
      'Medium': 'bg-yellow-50 text-yellow-700',
      'Low': 'bg-emerald-50 text-emerald-700'
    };
    return badges[urgency] || 'bg-gray-50 text-gray-600';
  };

  // Get status indicator dot
  const getStatusDot = (status) => {
    const dots = {
      'Open': 'bg-blue-500',
      'In Progress': 'bg-orange-500',
      'Pending Approval': 'bg-purple-500',
      'Resolved': 'bg-green-500',
      'Closed': 'bg-gray-400'
    };
    return dots[status] || 'bg-gray-400';
  };

  // Get urgency indicator dot
  const getUrgencyDot = (urgency) => {
    const dots = {
      'High': 'bg-red-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-emerald-500'
    };
    return dots[urgency] || 'bg-gray-400';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <Clock className="w-3 h-3" />;
      case 'In Progress':
        return <AlertTriangle className="w-3 h-3" />;
      case 'Pending Approval':
        return <AlertCircle className="w-3 h-3" />;
      case 'Resolved':
        return <CheckCircle className="w-3 h-3" />;
      case 'Closed':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Get status update message
  const getStatusUpdateMessage = (oldStatus, newStatus, ticketNumber) => {
    const statusMessages = {
      'Open': `Ticket ${ticketNumber} has been reopened and is now available for work`,
      'In Progress': `Ticket ${ticketNumber} is now being actively worked on`,
      'Resolved': `Ticket ${ticketNumber} has been marked as resolved`,
      'Closed': `Ticket ${ticketNumber} has been closed and completed`
    };
    
    return statusMessages[newStatus] || `Ticket ${ticketNumber} status updated to ${newStatus}`;
  };

  // Handle ticket status update (for managers and digital team)
  const handleStatusUpdate = async (ticketId, newStatus) => {
    const ticket = tickets.find(t => t.id === ticketId);
    const oldStatus = ticket?.status;
    let loadingToastId;
    
    try {
      loadingToastId = showLoadingToast(`Updating ticket status to ${newStatus}...`);
      
      await ticketsService.updateTicketStatus(ticketId, newStatus);
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus }
          : ticket
      ));
      
      // Dismiss loading toast
      dismissToast(loadingToastId);
      
      // Show success message
      const message = getStatusUpdateMessage(oldStatus, newStatus, ticket?.ticket_number);
      showSuccessToast(message, { duration: 4000 });
      
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      
      // Dismiss loading toast
      if (loadingToastId) {
        dismissToast(loadingToastId);
      }
      
      showErrorToast(
        `Failed to update ticket ${ticket?.ticket_number} status. Please try again.`,
        { duration: 5000 }
      );
    }
  };

  // Handle ticket approval (for managers only)
  const handleApproveTicket = async (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    let loadingToastId;
    
    try {
      loadingToastId = showLoadingToast(`Approving ticket ${ticket?.ticket_number}...`);
      
      await ticketsService.approveTicket(ticketId);
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'Open' }
          : ticket
      ));
      
      // Dismiss loading toast
      dismissToast(loadingToastId);
      
      // Show success message
      showSuccessToast(
        `Ticket ${ticket?.ticket_number} has been approved and is now open for work`,
        { duration: 4000 }
      );
      
    } catch (error) {
      console.error('Failed to approve ticket:', error);
      
      // Dismiss loading toast
      if (loadingToastId) {
        dismissToast(loadingToastId);
      }
      
      showErrorToast(
        `Failed to approve ticket ${ticket?.ticket_number}. Please try again.`,
        { duration: 5000 }
      );
    }
  };

  // Handle filter changes with user feedback
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        // Only show toast for specific filters, not "all"
        if (value !== 'all') {
          showSuccessToast(`Showing ${value} tickets`, { duration: 2000 });
        }
        break;
      case 'urgency':
        setUrgencyFilter(value);
        // Only show toast for specific filters, not "all"
        if (value !== 'all') {
          showSuccessToast(`Showing ${value} priority tickets`, { duration: 2000 });
        }
        break;
      default:
        break;
    }
  };

  // Handle search without immediate feedback
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Remove the automatic search feedback to reduce toast spam
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <div className="flex items-center space-x-5">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-60 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Loading tickets...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-5 mb-6 lg:mb-0">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  {user?.role === 'manager' || user?.role === 'digital_team' ? 'All Tickets' : 'My Tickets'}
                </h1>
                <p className="text-gray-500 mt-1">
                  {user?.role === 'manager' ? 'Manage and track all support tickets' :
                   user?.role === 'digital_team' ? 'View and work on assigned tickets' :
                   'Track your submitted support requests'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/create-ticket')}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 flex items-center transition-all duration-200 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <select
                value={urgencyFilter}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className="w-full px-4 py-2.5 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Urgency</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
          
          {/* Filter Results Summary */}
          {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredTickets.length}</span> of <span className="font-semibold text-gray-900">{tickets.length}</span> tickets
                  {searchTerm && ` matching "${searchTerm}"`}
                  {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                  {urgencyFilter !== 'all' && ` with urgency "${urgencyFilter}"`}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setUrgencyFilter('all');
                    showSuccessToast('Filters cleared successfully', { duration: 2000 });
                  }}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No tickets found</h3>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
              {tickets.length === 0 
                ? "You haven't created any tickets yet. Get started by creating your first support ticket." 
                : "No tickets match your current filters. Try adjusting your search criteria."}
            </p>
            {tickets.length === 0 && (
              <button
                onClick={() => navigate('/create-ticket')}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Create Your First Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
                {/* Ticket Header */}
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between mb-6">
                  <div className="flex-1 xl:mr-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {ticket.ticket_number}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(ticket.status)}`}></div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusBadge(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getUrgencyDot(ticket.urgency)}`}></div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getUrgencyBadge(ticket.urgency)}`}>
                          {ticket.urgency}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                      {ticket.title}
                    </h3>
                    
                    <p className="text-gray-600 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>
                </div>

                {/* Ticket Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{ticket.created_by_name || user?.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span>{ticket.category_name}</span>
                  </div>
                  
                  {ticket.assigned_to_name && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Assigned: {ticket.assigned_to_name}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium flex items-center group"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                  
                  {/* Manager/Digital Team Actions */}
                  {(user?.role === 'manager' || user?.role === 'digital_team') && (
                    <>
                      {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 transition-all duration-200 cursor-pointer font-medium"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      )}
                      
                      {/* Manager Approval */}
                      {user?.role === 'manager' && ticket.status === 'Pending Approval' && (
                        <button
                          onClick={() => handleApproveTicket(ticket.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                        >
                          Approve
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;