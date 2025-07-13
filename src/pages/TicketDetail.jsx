import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Globe,
  Code,
  Tag,
  Mail,
  Edit3,
  Send,
  History,
  CheckCircle2,
  UserCheck,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/tickets';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastUtils';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDetailsExpanded, setShowDetailsExpanded] = useState(false);
  
  // Form states
  const [remarkForm, setRemarkForm] = useState({
    remark: '',
    status: ''
  });

  // Load ticket data
  useEffect(() => {
    const loadTicketData = async () => {
      try {
        setLoading(true);
        const [ticketData, historyData] = await Promise.all([
          ticketsService.getTicket(id),
          ticketsService.getTicketHistory(id)
        ]);
        
        setTicket(ticketData);
        setHistory(historyData);
        setRemarkForm(prev => ({ ...prev, status: ticketData.status }));
      } catch (error) {
        console.error('Failed to load ticket:', error);
        showErrorToast('Failed to load ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTicketData();
    }
  }, [id]);

  // Check if user can update ticket
  const canUpdateTicket = () => {
    if (!ticket || !user) return false;
    
    // Managers can update any ticket
    if (user.role === 'manager') return true;
    
    // Digital team members can update tickets, but not their own pending approval tickets
    if (user.role === 'digital_team') {
      if (ticket.created_by_email === user.email && ticket.status === 'Pending Approval') {
        return false;
      }
      return true;
    }
    
    return false;
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    let loadingToastId;
    
    try {
      setUpdating(true);
      loadingToastId = showLoadingToast(`Updating ticket status to ${newStatus}...`);
      
      await ticketsService.updateTicketStatus(id, newStatus);
      
      // Update local state
      setTicket(prev => ({ ...prev, status: newStatus }));
      
      // Reload history to show the change
      const historyData = await ticketsService.getTicketHistory(id);
      setHistory(historyData);
      
      dismissToast(loadingToastId);
      showSuccessToast(`Ticket status updated to ${newStatus}`, { duration: 3000 });
      
    } catch (error) {
      console.error('Failed to update status:', error);
      if (loadingToastId) dismissToast(loadingToastId);
      showErrorToast('Failed to update ticket status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle remark submission
  const handleRemarkSubmit = async (e) => {
    e.preventDefault();
    
    if (!remarkForm.remark.trim()) {
      showErrorToast('Please enter a remark before submitting.');
      return;
    }
    
    let loadingToastId;
    
    try {
      setUpdating(true);
      loadingToastId = showLoadingToast('Adding remark...');
      
      await ticketsService.addTicketRemark(id, remarkForm.remark, remarkForm.status);
      
      // Update local state
      setTicket(prev => ({ 
        ...prev, 
        remark: remarkForm.remark, 
        status: remarkForm.status 
      }));
      
      // Reload history to show the change
      const historyData = await ticketsService.getTicketHistory(id);
      setHistory(historyData);
      
      // Reset form
      setRemarkForm({ remark: '', status: remarkForm.status });
      setShowRemarkForm(false);
      
      dismissToast(loadingToastId);
      showSuccessToast('Remark added successfully', { duration: 3000 });
      
    } catch (error) {
      console.error('Failed to add remark:', error);
      if (loadingToastId) dismissToast(loadingToastId);
      showErrorToast('Failed to add remark. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle ticket approval
  const handleApproveTicket = async () => {
    let loadingToastId;
    
    try {
      setUpdating(true);
      loadingToastId = showLoadingToast('Approving ticket...');
      
      await ticketsService.approveTicket(id);
      
      // Update local state
      setTicket(prev => ({ ...prev, status: 'Open' }));
      
      // Reload history to show the change
      const historyData = await ticketsService.getTicketHistory(id);
      setHistory(historyData);
      
      dismissToast(loadingToastId);
      showSuccessToast('Ticket approved successfully', { duration: 3000 });
      
    } catch (error) {
      console.error('Failed to approve ticket:', error);
      if (loadingToastId) dismissToast(loadingToastId);
      showErrorToast('Failed to approve ticket. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      'Open': 'bg-slate-100 text-slate-700 border-slate-200',
      'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
      'Pending Approval': 'bg-orange-50 text-orange-700 border-orange-200',
      'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Pending Approval':
        return <AlertCircle className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format history date
  const formatHistoryDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-1/3 mb-4 sm:mb-6"></div>
              <div className="h-8 sm:h-12 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6 sm:mb-8"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
                <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="p-3 sm:p-4 bg-red-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-900 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <span className="font-mono text-sm sm:text-lg font-bold text-gray-900 bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-lg truncate">
                {ticket.ticket_number}
              </span>
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusBadge(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1 sm:ml-2 hidden sm:inline">{ticket.status}</span>
              </span>
            </div>
            
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">View History</span>
              <span className="sm:hidden">History</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Ticket Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getUrgencyBadge(ticket.urgency)}`}>
                  {ticket.urgency} Priority
                </span>
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusBadge(ticket.status)} sm:hidden`}>
                  {getStatusIcon(ticket.status)}
                  <span className="ml-1">{ticket.status}</span>
                </span>
              </div>
              
              {/* Manager Approval Button */}
              {user?.role === 'manager' && ticket.status === 'Pending Approval' && (
                <button
                  onClick={handleApproveTicket}
                  disabled={updating}
                  className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {updating ? 'Approving...' : 'Approve'}
                </button>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">{ticket.title}</h1>
            <p className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{ticket.description}</p>

            {/* Essential Details - Always Visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Created by</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{ticket.created_by_name}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Created on</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(ticket.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Additional Details - Collapsible on Mobile */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowDetailsExpanded(!showDetailsExpanded)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors py-2"
              >
                <span>More Details</span>
                {showDetailsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${showDetailsExpanded ? 'block' : 'hidden sm:grid'}`}>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.category_name}</p>
                  </div>
                </div>

                {ticket.subcategory_name && (
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Subcategory</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.subcategory_name}</p>
                    </div>
                  </div>
                )}

                {ticket.software_name && (
                  <div className="flex items-center">
                    <Code className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Software</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.software_name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {ticket.subcategory_text && (
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Additional Info</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{ticket.subcategory_text}</p>
                    </div>
                  </div>
                )}

                {ticket.system_url && (
                  <div className="flex items-start">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">System URL</p>
                      <a 
                        href={ticket.system_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base break-all"
                      >
                        {ticket.system_url}
                      </a>
                    </div>
                  </div>
                )}

                {ticket.assigned_to_name && (
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Assigned to</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.assigned_to_name}</p>
                    </div>
                  </div>
                )}

                {ticket.mentioned_support_person_name && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Support Person</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{ticket.mentioned_support_person_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Remarks
            </h2>

            {ticket.remark ? (
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{ticket.remark}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Last updated: {formatDate(ticket.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No remarks have been added to this ticket yet.</p>
              </div>
            )}

            {/* Add Remark Form (Digital Team & Manager) */}
            {canUpdateTicket() && (
              <div>
                {!showRemarkForm ? (
                  <button
                    onClick={() => setShowRemarkForm(true)}
                    className="w-full sm:w-auto bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center text-sm sm:text-base"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Add Remark
                  </button>
                ) : (
                  <form onSubmit={handleRemarkSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Remark
                      </label>
                      <textarea
                        value={remarkForm.remark}
                        onChange={(e) => setRemarkForm(prev => ({ ...prev, remark: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm sm:text-base"
                        rows="4"
                        placeholder="Enter your remark here..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Status
                      </label>
                      <select
                        value={remarkForm.status}
                        onChange={(e) => setRemarkForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full sm:w-auto bg-gray-900 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {updating ? 'Adding...' : 'Add Remark'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRemarkForm(false);
                          setRemarkForm(prev => ({ ...prev, remark: '' }));
                        }}
                        className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Update Section (Digital Team & Manager) */}
        {canUpdateTicket() && !showRemarkForm && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Quick Status Update
              </h2>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating || ticket.status === status}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center justify-center ${
                      ticket.status === status
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {getStatusIcon(status)}
                    <span className="ml-1 sm:ml-2">{status}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Ticket History</h2>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No history available for this ticket.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{item.changed_by_name}</span>
                          <span className="text-sm text-gray-500">{formatHistoryDate(item.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{item.change_reason}</p>
                        <div className="text-xs text-gray-500">
                          {item.field_name}: {item.old_value} → {item.new_value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;