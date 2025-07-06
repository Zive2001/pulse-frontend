import api from './api';

export const ticketsService = {
  // Get all categories with subcategories
  async getCategories() {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  // Get support persons by category
  async getSupportPersons(categoryId) {
    try {
      const response = await api.get(`/categories/${categoryId}/support-persons`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch support persons');
    }
  },

  // Create a new ticket
  async createTicket(ticketData) {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create ticket');
    }
  },

  // Get user's tickets
  async getMyTickets() {
    try {
      const response = await api.get('/tickets');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch your tickets');
    }
  },

  // Get all tickets (admin/manager view)
  async getAllTickets() {
    try {
      const response = await api.get('/tickets/all');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch all tickets');
    }
  },

  // Get specific ticket by ID
  async getTicket(ticketId) {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch ticket');
    }
  },

  // Update ticket status
  async updateTicketStatus(ticketId, status, assignedTo = null) {
    try {
      const payload = { status };
      if (assignedTo) {
        payload.assigned_to = assignedTo;
      }
      
      const response = await api.put(`/tickets/${ticketId}/status`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update ticket status');
    }
  },

  // Approve ticket (manager only)
  async approveTicket(ticketId) {
    try {
      const response = await api.put(`/tickets/${ticketId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to approve ticket');
    }
  },

  // Get ticket history
  async getTicketHistory(ticketId) {
    try {
      const response = await api.get(`/tickets/${ticketId}/history`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch ticket history');
    }
  },
};