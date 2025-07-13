// src/services/admin.js
import api from './api';

export const adminService = {
  // Ticket Management
  async getAllTickets() {
    try {
      const response = await api.get('/api/admin/tickets');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
    }
  },

  async deleteTicket(ticketId, reason) {
    try {
      const response = await api.delete(`/api/admin/tickets/${ticketId}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete ticket');
    }
  },

  // Support Person Management
  async getSupportPersons() {
    try {
      const response = await api.get('/api/admin/support-persons');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch support persons');
    }
  },

  async addSupportPerson(supportPersonData) {
    try {
      const response = await api.post('/api/admin/support-persons', supportPersonData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add support person');
    }
  },

  async updateSupportPerson(id, supportPersonData) {
    try {
      const response = await api.put(`/api/admin/support-persons/${id}`, supportPersonData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update support person');
    }
  },

  async deleteSupportPerson(id) {
    try {
      const response = await api.delete(`/api/admin/support-persons/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete support person');
    }
  },

  // User/Manager Management
  async getAllUsers() {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  async addManager(managerData) {
    try {
      const response = await api.post('/api/admin/managers', managerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add manager');
    }
  },

  async updateUserRole(userId, roleData) {
    try {
      const response = await api.put(`/api/admin/users/${userId}/role`, roleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  },

  // Category Management
  async getCategories() {
    try {
      const response = await api.get('/api/admin/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  async addCategory(categoryData) {
    try {
      const response = await api.post('/api/admin/categories', categoryData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add category');
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/api/admin/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update category');
    }
  },

  async deleteCategory(id) {
    try {
      const response = await api.delete(`/api/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
  },

  // Subcategory Management
  async getSubcategories() {
    try {
      const response = await api.get('/api/admin/subcategories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  },

  async addSubcategory(subcategoryData) {
    try {
      const response = await api.post('/api/admin/subcategories', subcategoryData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add subcategory');
    }
  },

  async updateSubcategory(id, subcategoryData) {
    try {
      const response = await api.put(`/api/admin/subcategories/${id}`, subcategoryData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update subcategory');
    }
  },

  async deleteSubcategory(id) {
    try {
      const response = await api.delete(`/api/admin/subcategories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete subcategory');
    }
  },

  // Admin Logs
  async getAdminLogs() {
    try {
      const response = await api.get('/api/admin/logs');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin logs');
    }
  }
};