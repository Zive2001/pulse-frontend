// src/services/tickets.js
import api from './api';

export const ticketsService = {
  // Get all categories with subcategories
  async getCategories() {
    try {
      const response = await api.get('/api/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  // Get support persons by category
  async getSupportPersons(categoryId) {
    try {
      const response = await api.get(`/api/categories/${categoryId}/support-persons`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch support persons');
    }
  },

  // Get all support persons (for filtering) - FIXED ENDPOINT
  async getAllSupportPersons() {
    try {
      const response = await api.get('/api/categories/support-persons/all');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch support persons');
    }
  },

  // Create a new ticket
  async createTicket(ticketData) {
    try {
      const response = await api.post('/api/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create ticket');
    }
  },

  // Get user's tickets
  async getMyTickets() {
    try {
      const response = await api.get('/api/tickets');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch your tickets');
    }
  },

  // Get all tickets (admin/manager/digital_team view)
  async getAllTickets() {
    try {
      const response = await api.get('/api/tickets/all');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch all tickets');
    }
  },

  // Get specific ticket by ID
  async getTicket(ticketId) {
    try {
      const response = await api.get(`/api/tickets/${ticketId}`);
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
      
      const response = await api.put(`/api/tickets/${ticketId}/status`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update ticket status');
    }
  },

  // Add remark to ticket
  async addTicketRemark(ticketId, remark, status = null) {
    try {
      const payload = { remark };
      if (status) {
        payload.status = status;
      }
      
      const response = await api.put(`/api/tickets/${ticketId}/remark`, payload);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to add remark');
    }
  },

  // Approve ticket (manager only)
  async approveTicket(ticketId) {
    try {
      const response = await api.put(`/api/tickets/${ticketId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to approve ticket');
    }
  },

  // Reject ticket (manager only)
  async rejectTicket(ticketId) {
    try {
      const response = await api.put(`/api/tickets/${ticketId}/reject`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to reject ticket');
    }
  },

  // Get ticket history
  async getTicketHistory(ticketId) {
    try {
      const response = await api.get(`/api/tickets/${ticketId}/history`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch ticket history');
    }
  },
};