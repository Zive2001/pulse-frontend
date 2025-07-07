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
  MessageSquare
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
        
        // Dismiss loading toast and show success
        dismissToast(loadingToastId);
        
        if (ticketsData.length > 0) {
          showSuccessToast(
            `Successfully loaded ${ticketsData.length} ticket${ticketsData.length !== 1 ? 's' : ''}`,
            { duration: 3000 }
          );
        }
        
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
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Pending Approval': 'bg-orange-100 text-orange-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Get urgency badge styling
  const getUrgencyBadge = (urgency) => {
    const badges = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return badges[urgency] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
        if (value !== 'all') {
          showSuccessToast(`Filtered by status: ${value}`, { duration: 2000 });
        }
        break;
      case 'urgency':
        setUrgencyFilter(value);
        if (value !== 'all') {
          showSuccessToast(`Filtered by urgency: ${value}`, { duration: 2000 });
        }
        break;
      default:
        break;
    }
  };

  // Handle search with debounced feedback
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.length >= 3) {
      const matchingTickets = tickets.filter(ticket => 
        ticket.title.toLowerCase().includes(value.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(value.toLowerCase()) ||
        ticket.description.toLowerCase().includes(value.toLowerCase())
      );
      
      if (matchingTickets.length === 0) {
        showErrorToast(`No tickets found matching "${value}"`, { duration: 3000 });
      }
    }
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.role === 'manager' || user?.role === 'digital_team' ? 'All Tickets' : 'My Tickets'}
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'manager' ? 'Manage and track all support tickets' :
                   user?.role === 'digital_team' ? 'View and work on assigned tickets' :
                   'Track your submitted support requests'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/create-ticket')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">All Urgency</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          
          {/* Filter Results Summary */}
          {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredTickets.length} of {tickets.length} tickets
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                {urgencyFilter !== 'all' && ` with urgency "${urgencyFilter}"`}
              </p>
            </div>
          )}
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-4">
              {tickets.length === 0 
                ? "You haven't created any tickets yet." 
                : "No tickets match your current filters."}
            </p>
            {tickets.length === 0 && (
              <button
                onClick={() => navigate('/create-ticket')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Ticket
              </button>
            )}
            {tickets.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setUrgencyFilter('all');
                  showSuccessToast('Filters cleared successfully', { duration: 2000 });
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-sm font-medium text-blue-600">
                          {ticket.ticket_number}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadge(ticket.urgency)}`}>
                          {ticket.urgency}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {ticket.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{ticket.created_by_name || user?.name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span>{ticket.category_name}</span>
                    </div>
                    
                    {ticket.assigned_to_name && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>Assigned to: {ticket.assigned_to_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      View Details
                    </button>
                    
                    {/* Manager/Digital Team Actions */}
                    {(user?.role === 'manager' || user?.role === 'digital_team') && (
                      <>
                        {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm border-0 focus:ring-2 focus:ring-blue-500 transition-all"
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
                            className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </>
                    )}
                  </div>
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