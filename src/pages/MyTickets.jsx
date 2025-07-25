import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck,
  UserX,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/tickets';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastUtils';

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [supportPersons, setSupportPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [supportPersonFilter, setSupportPersonFilter] = useState('all');
  
  // Use ref to track loading state and prevent duplicate calls
  const loadingRef = useRef(false);
  const loadingToastIdRef = useRef(null);

  // Load tickets and support persons based on user role
  useEffect(() => {
    const loadData = async () => {
      // Prevent multiple simultaneous calls
      if (loadingRef.current || !user) {
        return;
      }
      
      loadingRef.current = true;
      
      try {
        setLoading(true);
        
        // Only show loading toast if we don't already have one
        if (!loadingToastIdRef.current) {
          loadingToastIdRef.current = showLoadingToast('Loading tickets...');
        }
        
        let ticketsData;
        let supportPersonsData = [];
        
        if (user?.role === 'manager' || user?.role === 'digital_team' || user?.role === 'admin') {
          // Managers, digital team, and admin see all tickets
          ticketsData = await ticketsService.getAllTickets();
          
          // Get support persons for filtering (only for management views)
          try {
            supportPersonsData = await ticketsService.getAllSupportPersons();
          } catch (error) {
            console.warn('Failed to load support persons:', error);
          }
        } else {
          // General users see only their tickets
          ticketsData = await ticketsService.getMyTickets();
        }
        
        setTickets(ticketsData);
        setSupportPersons(supportPersonsData);
        
        // Dismiss loading toast if it exists
        if (loadingToastIdRef.current) {
          dismissToast(loadingToastIdRef.current);
          loadingToastIdRef.current = null;
        }
        
      } catch (error) {
        console.error('Failed to load data:', error);
        
        // Dismiss loading toast if it exists
        if (loadingToastIdRef.current) {
          dismissToast(loadingToastIdRef.current);
          loadingToastIdRef.current = null;
        }
        
        showErrorToast(
          'Failed to load tickets. Please refresh the page and try again.',
          { duration: 5000 }
        );
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadData();
    
    // Cleanup function to dismiss toast if component unmounts
    return () => {
      if (loadingToastIdRef.current) {
        dismissToast(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }
      loadingRef.current = false;
    };
  }, [user?.id]);

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || ticket.urgency === urgencyFilter;
    const matchesSupportPerson = supportPersonFilter === 'all' || ticket.mentioned_support_person_name === supportPersonFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesSupportPerson;
  });

  // Check if user can update ticket status
  const canUpdateTicketStatus = (ticket) => {
    // Managers can update any ticket
    if (user?.role === 'manager') {
      return true;
    }
    
    // Digital team members and admin can update tickets, but NOT their own tickets that are pending approval
    if (user?.role === 'digital_team' || user?.role === 'admin') {
      // If this is their own ticket and it's pending approval, they cannot update it
      if (ticket.created_by_email === user?.email && ticket.status === 'Pending Approval') {
        return false;
      }
      // They can update other tickets or their own tickets that have been approved
      return true;
    }
    
    // Regular users cannot update ticket status
    return false;
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      'Open': 'bg-slate-100 text-slate-700 border-slate-200',
      'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
      'Pending Approval': 'bg-orange-50 text-orange-700 border-orange-200',
      'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-red-50 text-red-700 border-red-200',
      'Closed': 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return badges[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  // Get urgency badge styling
  const getUrgencyBadge = (urgency) => {
    const badges = {
      'High': 'bg-red-50 text-red-700 border-red-200',
      'Medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Low': 'bg-green-50 text-green-700 border-green-200'
    };
    return badges[urgency] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <Clock className="w-3.5 h-3.5" />;
      case 'In Progress':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'Pending Approval':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Resolved':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'Closed':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
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

  // Handle ticket status update (for managers, digital team, and admin)
  const handleStatusUpdate = async (ticketId, newStatus) => {
    const ticket = tickets.find(t => t.id === ticketId);
    
    // Additional check to prevent digital team/admin from updating their own pending tickets
    if (!canUpdateTicketStatus(ticket)) {
      showErrorToast(
        'You cannot update the status of your own ticket while it is pending approval.',
        { duration: 5000 }
      );
      return;
    }
    
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

  // Handle ticket rejection (for managers only)
  const handleRejectTicket = async (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    let loadingToastId;
    
    try {
      loadingToastId = showLoadingToast(`Rejecting ticket ${ticket?.ticket_number}...`);
      
      await ticketsService.rejectTicket(ticketId);
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'Rejected' }
          : ticket
      ));
      
      // Dismiss loading toast
      dismissToast(loadingToastId);
      
      // Show success message
      showSuccessToast(
        `Ticket ${ticket?.ticket_number} has been rejected`,
        { duration: 4000 }
      );
      
    } catch (error) {
      console.error('Failed to reject ticket:', error);
      
      // Dismiss loading toast
      if (loadingToastId) {
        dismissToast(loadingToastId);
      }
      
      showErrorToast(
        `Failed to reject ticket ${ticket?.ticket_number}. Please try again.`,
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
      case 'supportPerson':
        setSupportPersonFilter(value);
        if (value !== 'all') {
          showSuccessToast(`Showing tickets for ${value}`, { duration: 2000 });
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

  // Check if user is in management role
  const isManagementRole = () => {
    return user?.role === 'manager' || user?.role === 'digital_team' || user?.role === 'admin';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200/60">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Ticket className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <div className="h-7 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-60 mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-700"></div>
            <span className="text-gray-600 font-medium">Loading tickets...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-6 sm:mb-0">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Ticket className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isManagementRole() ? 'All Tickets' : 'My Tickets'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.role === 'manager' ? 'Manage and track all support tickets' :
                   user?.role === 'digital_team' ? 'View and work on assigned tickets' :
                   user?.role === 'admin' ? 'System-wide ticket management and oversight' :
                   'Track your submitted support requests'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/create-ticket')}
              className="bg-gray-900 text-white px-5 py-2 rounded-2xl hover:bg-gray-800 flex items-center transition-colors font-medium shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className={`grid grid-cols-1 ${isManagementRole() ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <select
                value={urgencyFilter}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Urgency</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Support Person Filter - Only for management roles */}
            {isManagementRole() && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={supportPersonFilter}
                  onChange={(e) => handleFilterChange('supportPerson', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Support Persons</option>
                  {supportPersons.map((person) => (
                    <option key={person.id} value={person.name}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Filter Results Summary */}
          {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all' || supportPersonFilter !== 'all') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">{filteredTickets.length}</span> of <span className="font-medium text-gray-900">{tickets.length}</span> tickets
                  {searchTerm && ` matching "${searchTerm}"`}
                  {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                  {urgencyFilter !== 'all' && ` with urgency "${urgencyFilter}"`}
                  {supportPersonFilter !== 'all' && ` for support person "${supportPersonFilter}"`}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setUrgencyFilter('all');
                    setSupportPersonFilter('all');
                    showSuccessToast('Filters cleared successfully', { duration: 2000 });
                  }}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No tickets found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {tickets.length === 0 
                ? "You haven't created any tickets yet. Get started by creating your first support ticket." 
                : "No tickets match your current filters. Try adjusting your search criteria."}
            </p>
            {tickets.length === 0 && (
              <button
                onClick={() => navigate('/create-ticket')}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Create Your First Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-md transition-all duration-200 group">
                <div className="p-6">
                  {/* Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                          {ticket.ticket_number}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1.5">{ticket.status}</span>
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyBadge(ticket.urgency)}`}>
                          {ticket.urgency}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {ticket.title}
                      </h3>
                      
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {ticket.description}
                      </p>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{ticket.created_by_name || user?.name}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{ticket.category_name}</span>
                    </div>
                    
                    {ticket.assigned_to_name && (
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Assigned to: {ticket.assigned_to_name}</span>
                      </div>
                    )}
                    
                    {ticket.mentioned_support_person_name && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Support: {ticket.mentioned_support_person_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors font-medium flex items-center group"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    
                    {/* Manager/Digital Team/Admin Actions */}
                    {canUpdateTicketStatus(ticket) && (
                      <>
                        {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && ticket.status !== 'Rejected' && (
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm border-0 focus:ring-2 focus:ring-gray-900 transition-all cursor-pointer font-medium"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        )}
                      </>
                    )}
                    
                    {/* Manager Approval/Rejection */}
                    {user?.role === 'manager' && ticket.status === 'Pending Approval' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveTicket(ticket.id)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors font-medium flex items-center"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTicket(ticket.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium flex items-center"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {/* Show warning message for digital team/admin members viewing their own pending tickets */}
                    {(user?.role === 'digital_team' || user?.role === 'admin') && 
                     ticket.created_by_email === user?.email && 
                     ticket.status === 'Pending Approval' && (
                      <div className="text-orange-600 text-sm bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Awaiting manager approval
                      </div>
                    )}
                    
                    {/* Show rejected status message */}
                    {ticket.status === 'Rejected' && (
                      <div className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Ticket rejected by manager
                      </div>
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