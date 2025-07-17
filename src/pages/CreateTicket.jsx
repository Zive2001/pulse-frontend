import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Ticket, Send } from 'lucide-react';
import { ticketsService } from '../services/tickets';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastUtils';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    subcategory_text: '',
    software_name: '',
    system_url: '',
    type: '',
    urgency: '',
    mentioned_support_person: ''
  });
  
  // Data state
  const [categories, setCategories] = useState([]);
  const [supportPersons, setSupportPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await ticketsService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
        showErrorToast('Failed to load categories. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Load support persons when category changes
  useEffect(() => {
    const loadSupportPersons = async () => {
      if (formData.category_id) {
        try {
          const supportData = await ticketsService.getSupportPersons(formData.category_id);
          setSupportPersons(supportData);
        } catch (error) {
          console.error('Failed to load support persons:', error);
          setSupportPersons([]);
          showErrorToast('Failed to load support persons for this category.');
        }
      } else {
        setSupportPersons([]);
      }
    };
    loadSupportPersons();
  }, [formData.category_id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset related fields when category changes
    if (name === 'category_id') {
      setFormData(prev => ({
        ...prev,
        subcategory_id: '',
        subcategory_text: '',
        mentioned_support_person: ''
      }));
    }
  };

  // Get current category and subcategory
  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === parseInt(formData.category_id));
  };

  const getCurrentSubcategory = () => {
    const category = getCurrentCategory();
    if (!category) return null;
    return category.subcategories?.find(sub => sub.id === parseInt(formData.subcategory_id));
  };

  // Check if we should show software fields
  const shouldShowSoftwareFields = () => {
    const category = getCurrentCategory();
    return category?.name === 'Software Systems';
  };

  // Check if we should show subcategory text input
  const shouldShowSubcategoryText = () => {
    const subcategory = getCurrentSubcategory();
    return subcategory?.requires_text_input;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.type) {
      newErrors.type = 'Request type is required';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Urgency is required';
    }

    if (shouldShowSubcategoryText() && !formData.subcategory_text.trim()) {
      newErrors.subcategory_text = 'Please specify the details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (show confirmation dialog)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast('Please fix the errors in the form before submitting.');
      return;
    }

    setShowConfirmDialog(true);
  };

  // Handle confirmed submission
  const handleConfirmedSubmit = async () => {
    let loadingToastId;
    
    try {
      setIsSubmitting(true);
      loadingToastId = showLoadingToast('Creating your support ticket...');
      
      // Clean up the data
      const submitData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : undefined,
        mentioned_support_person: formData.mentioned_support_person ? parseInt(formData.mentioned_support_person) : undefined
      };

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      const result = await ticketsService.createTicket(submitData);
      
      // Dismiss loading toast
      dismissToast(loadingToastId);
      
      // Show success toast
      showSuccessToast(
        `Ticket created successfully! Ticket number: ${result.ticket_number}`,
        { duration: 6000 }
      );
      
      setCreatedTicket(result);
      setShowSuccess(true);
      setShowConfirmDialog(false);
      
    } catch (error) {
      console.error('Failed to create ticket:', error);
      
      // Dismiss loading toast
      if (loadingToastId) {
        dismissToast(loadingToastId);
      }
      
      // Show error toast
      showErrorToast(
        error.message || 'Failed to create ticket. Please try again.',
        { duration: 6000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate confirmation message
  const getConfirmationMessage = () => {
    const category = getCurrentCategory();
    const urgencyText = formData.urgency === 'High' ? 'urgent' : formData.urgency.toLowerCase();
    
    return `You are about to create a ${urgencyText} ${formData.type.toLowerCase()} ticket for "${category?.name}" category. 
    
The ticket will be submitted with the title: "${formData.title}"

Are you sure you want to proceed?`;
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      subcategory_text: '',
      software_name: '',
      system_url: '',
      type: '',
      urgency: '',
      mentioned_support_person: ''
    });
    setErrors({});
    setShowSuccess(false);
    setCreatedTicket(null);
    showSuccessToast('Form reset successfully. You can create a new ticket.');
  };

  // Success page
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ticket Created Successfully!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your support ticket has been submitted and assigned ticket number{' '}
              <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {createdTicket?.ticket_number}
              </span>
            </p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => navigate('/my-tickets')}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                View My Tickets
              </button>
              
              <button 
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Create Another Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button> */}
          
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Ticket className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Support Ticket</h1>
              <p className="text-gray-600 mt-1 text-sm font-medium">Submit a request for technical support or assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading form...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Ticket Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief description of your issue..."
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-600 font-medium">{errors.title}</p>}
                </div>

                {/* Category and Subcategory */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                        errors.category_id ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category_id && <p className="mt-2 text-sm text-red-600 font-medium">{errors.category_id}</p>}
                  </div>

                  {getCurrentCategory()?.subcategories?.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Subcategory
                      </label>
                      <select
                        name="subcategory_id"
                        value={formData.subcategory_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent hover:border-gray-400 transition-all"
                      >
                        <option value="">Select a subcategory</option>
                        {getCurrentCategory().subcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Subcategory Text */}
                {shouldShowSubcategoryText() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Please specify *
                    </label>
                    <input
                      type="text"
                      name="subcategory_text"
                      value={formData.subcategory_text}
                      onChange={handleInputChange}
                      placeholder="Enter the specific details..."
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                        errors.subcategory_text ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.subcategory_text && <p className="mt-2 text-sm text-red-600 font-medium">{errors.subcategory_text}</p>}
                  </div>
                )}

                {/* Software Fields */}
                {shouldShowSoftwareFields() && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Software Name
                      </label>
                      <input
                        type="text"
                        name="software_name"
                        value={formData.software_name}
                        onChange={handleInputChange}
                        placeholder="e.g., VR, KOT, Gatepass..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent hover:border-gray-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        System URL
                      </label>
                      <input
                        type="url"
                        name="system_url"
                        value={formData.system_url}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent hover:border-gray-400 transition-all"
                      />
                      <p className="mt-2 text-sm text-gray-500">URL of the system you're having issues with</p>
                    </div>
                  </div>
                )}

                {/* Type and Urgency */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Request Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                        errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Select request type</option>
                      <option value="BreakFix">Break/Fix</option>
                      <option value="Application Error">Application Error</option>
                      <option value="Change Request">Change Request</option>
                    </select>
                    {errors.type && <p className="mt-2 text-sm text-red-600 font-medium">{errors.type}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Urgency *
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                        errors.urgency ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="">Select urgency level</option>
                      <option value="High">High - Urgent</option>
                      <option value="Medium">Medium - Normal</option>
                      <option value="Low">Low - When possible</option>
                    </select>
                    {errors.urgency && <p className="mt-2 text-sm text-red-600 font-medium">{errors.urgency}</p>}
                  </div>
                </div>

                {/* Support Person */}
                {supportPersons.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Preferred Support Person (Optional)
                    </label>
                    <select
                      name="mentioned_support_person"
                      value={formData.mentioned_support_person}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent hover:border-gray-400 transition-all"
                    >
                      <option value="">Select a support person</option>
                      {supportPersons.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.name} ({person.email})
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500">If you have a preferred support person for this request</p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Please provide a detailed description of your issue or request. Include any error messages, steps to reproduce, and what you've already tried..."
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none ${
                      errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.description && <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>}
                  <p className="mt-2 text-sm text-gray-500">Be as specific as possible to help us resolve your issue quickly</p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Create Ticket
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    disabled={isSubmitting}
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedSubmit}
        title="Create Support Ticket"
        message={getConfirmationMessage()}
        confirmText="Create Ticket"
        cancelText="Review Form"
        confirmButtonClass="bg-gray-900 text-white hover:bg-gray-800"
        isLoading={isSubmitting}
        icon={<Send className="w-6 h-6 text-gray-900" />}
      />
    </div>
  );
};

export default CreateTicket;