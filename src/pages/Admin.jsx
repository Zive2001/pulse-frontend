// src/pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { adminService } from '../services/admin';
import { ticketsService } from '../services/tickets';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const TABS = {
  USERS: 'users',
  SUPPORT_PERSONS: 'supportPersons',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  TICKETS: 'tickets',
  LOGS: 'logs',
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState(TABS.USERS);
  const [users, setUsers] = useState([]);
  const [supportPersons, setSupportPersons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data on tab switch
  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case TABS.USERS:
          await fetchUsers();
          break;
        case TABS.SUPPORT_PERSONS:
          await fetchSupportPersons();
          break;
        case TABS.CATEGORIES:
          await fetchCategories();
          break;
        case TABS.SUBCATEGORIES:
          await fetchSubcategories();
          await fetchCategories(); // Also fetch categories for dropdown
          break;
        case TABS.TICKETS:
          await fetchTickets();
          break;
        case TABS.LOGS:
          await fetchLogs();
          break;
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Functions
  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    }
  };

  const fetchSupportPersons = async () => {
    try {
      const data = await adminService.getSupportPersons();
      setSupportPersons(data);
    } catch (error) {
      toast.error('Failed to fetch support persons');
      console.error('Error fetching support persons:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await adminService.getSubcategories();
      setSubcategories(data);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await adminService.getAllTickets();
      setTickets(data);
    } catch (error) {
      toast.error('Failed to fetch tickets');
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await adminService.getAdminLogs();
      setLogs(data);
    } catch (error) {
      toast.error('Failed to fetch logs');
      console.error('Error fetching logs:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-1 border-b mb-6 overflow-x-auto">
        {Object.entries(TABS).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setActiveTab(value)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === value
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {!loading && (
          <>
            {activeTab === TABS.USERS && (
              <UserManagementSection users={users} fetchUsers={fetchUsers} />
            )}
            {activeTab === TABS.SUPPORT_PERSONS && (
              <SupportPersonSection 
                supportPersons={supportPersons} 
                fetchSupportPersons={fetchSupportPersons}
                categories={categories}
                fetchCategories={fetchCategories}
              />
            )}
            {activeTab === TABS.CATEGORIES && (
              <CategorySection 
                categories={categories} 
                fetchCategories={fetchCategories} 
              />
            )}
            {activeTab === TABS.SUBCATEGORIES && (
              <SubcategorySection 
                subcategories={subcategories} 
                categories={categories}
                fetchSubcategories={fetchSubcategories}
                fetchCategories={fetchCategories}
              />
            )}
            {activeTab === TABS.TICKETS && (
              <TicketSection tickets={tickets} fetchTickets={fetchTickets} />
            )}
            {activeTab === TABS.LOGS && (
              <LogSection logs={logs} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------
// Section Components
// ---------------------

function UserManagementSection({ users, fetchUsers }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const handleAddManager = async (data) => {
    try {
      await adminService.addManager(data);
      toast.success('Manager added successfully');
      fetchUsers();
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to add manager');
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await adminService.updateUserRole(userId, { role });
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Users & Managers</h2>
      
      {/* Add Manager Form */}
      <form onSubmit={handleSubmit(handleAddManager)} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="manager@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
            )}
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Optional)
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Manager Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Manager'}
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                      user.role === 'digital_team' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role?.toUpperCase() || 'USER'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      defaultValue={user.role || 'user'}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="digital_team">Digital_Team</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupportPersonSection({ supportPersons, fetchSupportPersons, categories, fetchCategories }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  // Load categories when component mounts
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const handleAddSupportPerson = async (data) => {
    try {
      await adminService.addSupportPerson(data);
      toast.success('Support person added successfully');
      fetchSupportPersons();
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to add support person');
    }
  };

  const handleDeleteSupportPerson = async (id) => {
    if (!window.confirm('Are you sure you want to delete this support person?')) {
      return;
    }
    
    try {
      await adminService.deleteSupportPerson(id);
      toast.success('Support person deleted successfully');
      fetchSupportPersons();
    } catch (error) {
      toast.error(error.message || 'Failed to delete support person');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Support Persons</h2>
      
      {/* Add Support Person Form */}
      <form onSubmit={handleSubmit(handleAddSupportPerson)} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('category_id', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <span className="text-red-500 text-xs mt-1">{errors.category_id.message}</span>
            )}
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Support Person'}
            </button>
          </div>
        </div>
      </form>

      {/* Support Persons Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {supportPersons.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No support persons found
                </td>
              </tr>
            ) : (
              supportPersons.map((sp) => (
                <tr key={sp.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{sp.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sp.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sp.category_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sp.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDeleteSupportPerson(sp.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategorySection({ categories, fetchCategories }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const handleAddCategory = async (data) => {
    try {
      await adminService.addCategory(data);
      toast.success('Category added successfully');
      fetchCategories();
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all associated subcategories.')) {
      return;
    }
    
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Categories</h2>
      
      {/* Add Category Form */}
      <form onSubmit={handleSubmit(handleAddCategory)} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              {...register('name', { required: 'Category name is required' })}
              type="text"
              placeholder="e.g., Technical Support"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{cat.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubcategorySection({ subcategories, categories, fetchSubcategories, fetchCategories }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  // Fetch categories when component mounts if not already loaded
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const handleAddSubcategory = async (data) => {
    try {
      const subcategoryData = {
        ...data,
        category_id: parseInt(data.category_id),
        requires_text_input: data.requires_text_input || false
      };
      await adminService.addSubcategory(subcategoryData);
      toast.success('Subcategory added successfully');
      fetchSubcategories();
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to add subcategory');
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    
    try {
      await adminService.deleteSubcategory(id);
      toast.success('Subcategory deleted successfully');
      fetchSubcategories();
    } catch (error) {
      toast.error(error.message || 'Failed to delete subcategory');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Subcategories</h2>
      
      {/* Add Subcategory Form */}
      <form onSubmit={handleSubmit(handleAddSubcategory)} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory Name *
            </label>
            <input
              {...register('name', { required: 'Subcategory name is required' })}
              type="text"
              placeholder="e.g., Password Reset"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('category_id', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <span className="text-red-500 text-xs mt-1">{errors.category_id.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requires Text Input
            </label>
            <div className="flex items-center pt-2">
              <input
                {...register('requires_text_input')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Yes</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Subcategory'}
            </button>
          </div>
        </div>
      </form>

      {/* Subcategories Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Requires Text</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No subcategories found
                </td>
              </tr>
            ) : (
              subcategories.map((sc) => (
                <tr key={sc.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{sc.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sc.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sc.category_name || getCategoryName(sc.category_id)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sc.requires_text_input ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sc.requires_text_input ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDeleteSubcategory(sc.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TicketSection({ tickets, fetchTickets }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const handleDeleteTicket = async (data) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${data.ticketId}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteTicket(data.ticketId, data.reason);
      toast.success('Ticket deleted successfully');
      fetchTickets();
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to delete ticket');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Ticket Management</h2>
      
      {/* Delete Ticket Form */}
      <form onSubmit={handleSubmit(handleDeleteTicket)} className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800 mb-3">Delete Ticket</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-red-700 mb-1">
              Ticket ID *
            </label>
            <input
              {...register('ticketId', { required: 'Ticket ID is required' })}
              type="text"
              placeholder="e.g., 123"
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.ticketId && (
              <span className="text-red-500 text-xs mt-1">{errors.ticketId.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 mb-1">
              Reason for Deletion *
            </label>
            <input
              {...register('reason', { required: 'Reason is required' })}
              type="text"
              placeholder="e.g., Duplicate ticket, Spam, etc."
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.reason && (
              <span className="text-red-500 text-xs mt-1">{errors.reason.message}</span>
            )}
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Ticket'}
            </button>
          </div>
        </div>
      </form>

      {/* Tickets List */}
      <div className="bg-white rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3">All Tickets</h3>
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tickets found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ticket Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{ticket.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{ticket.ticket_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{ticket.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                        ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {ticket.created_by_name || ticket.created_by_email || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LogSection({ logs }) {
  const [expandedLog, setExpandedLog] = useState(null);

  const toggleLogExpansion = (index) => {
    setExpandedLog(expandedLog === index ? null : index);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Admin Logs</h2>
      
      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No logs found
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => {
            const isExpanded = expandedLog === index;
            
            return (
              <div key={log.id || index} className="bg-gray-50 rounded-lg border">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleLogExpansion(index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {log.action_type || 'Admin Action'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {log.action_description || 'No description'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {log.created_at 
                          ? new Date(log.created_at).toLocaleString()
                          : `Log ${index + 1}`
                        }
                      </div>
                      {log.admin_name && (
                        <div className="text-xs text-gray-600 mt-1">
                          by {log.admin_name} ({log.admin_email})
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t bg-white p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Action Type:</span>
                        <span className="ml-2 text-gray-900">{log.action_type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Target Type:</span>
                        <span className="ml-2 text-gray-900">{log.target_type}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Target ID:</span>
                        <span className="ml-2 text-gray-900">{log.target_id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Admin:</span>
                        <span className="ml-2 text-gray-900">{log.admin_name}</span>
                      </div>
                    </div>
                    {log.target_details && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-700">Details:</span>
                        <pre className="mt-1 text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto bg-gray-100 p-2 rounded">
                          {typeof log.target_details === 'string' 
                            ? log.target_details
                            : JSON.stringify(log.target_details, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}