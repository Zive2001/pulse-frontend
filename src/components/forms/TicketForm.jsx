import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Ticket, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { ticketsService } from '../../services/tickets';

const TicketForm = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [supportPersons, setSupportPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
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
    }
  });

  const watchedCategory = watch('category_id');
  const watchedSubcategory = watch('subcategory_id');

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await ticketsService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Load support persons when category changes
  useEffect(() => {
    const loadSupportPersons = async () => {
      if (watchedCategory) {
        try {
          const supportData = await ticketsService.getSupportPersons(watchedCategory);
          setSupportPersons(supportData);
        } catch (error) {
          console.error('Failed to load support persons:', error);
          setSupportPersons([]);
        }
      } else {
        setSupportPersons([]);
      }
    };

    loadSupportPersons();
    // Reset support person selection when category changes
    setValue('mentioned_support_person', '');
  }, [watchedCategory, setValue]);

  // Reset subcategory when category changes
  useEffect(() => {
    setValue('subcategory_id', '');
    setValue('subcategory_text', '');
  }, [watchedCategory, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Clean up the data
      const submitData = {
        ...data,
        category_id: parseInt(data.category_id),
        subcategory_id: data.subcategory_id ? parseInt(data.subcategory_id) : undefined,
        mentioned_support_person: data.mentioned_support_person ? parseInt(data.mentioned_support_person) : undefined
      };

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      const result = await ticketsService.createTicket(submitData);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      reset();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert(error.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === parseInt(watchedCategory));
  };

  const getCurrentSubcategory = () => {
    const category = getCurrentCategory();
    if (!category) return null;
    return category.subcategories?.find(sub => sub.id === parseInt(watchedSubcategory));
  };

  const shouldShowSoftwareFields = () => {
    const category = getCurrentCategory();
    return category?.name === 'Software Systems';
  };

  const shouldShowSubcategoryText = () => {
    const subcategory = getCurrentSubcategory();
    return subcategory?.requires_text_input;
  };

  const typeOptions = [
    { value: 'BreakFix', label: 'Break/Fix' },
    { value: 'Application Error', label: 'Application Error' },
    { value: 'Change Request', label: 'Change Request' }
  ];

  const urgencyOptions = [
    { value: 'High', label: 'High - Urgent' },
    { value: 'Medium', label: 'Medium - Normal' },
    { value: 'Low', label: 'Low - When possible' }
  ];

  if (loading) {
    return (
      <div className="w-full">
        <div className="card p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bodyline-600"></div>
            <span className="ml-2 text-gray-600">Loading form...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="card p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-bodyline-100 rounded-lg flex-shrink-0">
              <Ticket className="w-6 h-6 text-bodyline-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create Support Ticket</h1>
              <p className="text-sm sm:text-base text-gray-600">Submit a request for technical support or assistance</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title - Full Width */}
          <div className="w-full">
            <Controller
              name="title"
              control={control}
              rules={{ 
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                maxLength: { value: 255, message: 'Title must not exceed 255 characters' }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Ticket Title"
                  placeholder="Brief description of your issue..."
                  error={errors.title?.message}
                  required
                />
              )}
            />
          </div>

          {/* Category and Subcategory Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Category */}
            <div className="w-full">
              <Controller
                name="category_id"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Category"
                    placeholder="Select a category"
                    error={errors.category_id?.message}
                    options={categories.map(cat => ({
                      value: cat.id.toString(),
                      label: cat.name
                    }))}
                    required
                  />
                )}
              />
            </div>

            {/* Subcategory */}
            <div className="w-full">
              {getCurrentCategory()?.subcategories?.length > 0 && (
                <Controller
                  name="subcategory_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Subcategory"
                      placeholder="Select a subcategory"
                      error={errors.subcategory_id?.message}
                      options={getCurrentCategory().subcategories.map(sub => ({
                        value: sub.id.toString(),
                        label: sub.name
                      }))}
                    />
                  )}
                />
              )}
            </div>
          </div>

          {/* Subcategory Text Input - Full Width */}
          {shouldShowSubcategoryText() && (
            <div className="w-full">
              <Controller
                name="subcategory_text"
                control={control}
                rules={{ required: 'Please specify the details' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Please specify"
                    placeholder="Enter the specific details..."
                    error={errors.subcategory_text?.message}
                    required
                  />
                )}
              />
            </div>
          )}

          {/* Software Fields Row */}
          {shouldShowSoftwareFields() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="w-full">
                <Controller
                  name="software_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Software Name"
                      placeholder="e.g., SAP, Oracle, Microsoft Teams..."
                      error={errors.software_name?.message}
                    />
                  )}
                />
              </div>

              <div className="w-full">
                <Controller
                  name="system_url"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="System URL"
                      placeholder="https://..."
                      error={errors.system_url?.message}
                      helpText="URL of the system you're having issues with"
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* Type and Urgency Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Type */}
            <div className="w-full">
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Request type is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Request Type"
                    placeholder="Select request type"
                    error={errors.type?.message}
                    options={typeOptions}
                    required
                  />
                )}
              />
            </div>

            {/* Urgency */}
            <div className="w-full">
              <Controller
                name="urgency"
                control={control}
                rules={{ required: 'Urgency level is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Urgency"
                    placeholder="Select urgency level"
                    error={errors.urgency?.message}
                    options={urgencyOptions}
                    required
                  />
                )}
              />
            </div>
          </div>

          {/* Support Person - Full Width */}
          {supportPersons.length > 0 && (
            <div className="w-full">
              <Controller
                name="mentioned_support_person"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Preferred Support Person (Optional)"
                    placeholder="Select a support person"
                    error={errors.mentioned_support_person?.message}
                    options={supportPersons.map(person => ({
                      value: person.id.toString(),
                      label: `${person.name} (${person.email})`
                    }))}
                    helpText="If you have a preferred support person for this request"
                  />
                )}
              />
            </div>
          )}

          {/* Description - Full Width */}
          <div className="w-full">
            <Controller
              name="description"
              control={control}
              rules={{ 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' }
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Detailed Description"
                  placeholder="Please provide a detailed description of your issue or request. Include any error messages, steps to reproduce, and what you've already tried..."
                  rows={6}
                  error={errors.description?.message}
                  required
                  helpText="Be as specific as possible to help us resolve your issue quickly"
                />
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              icon={CheckCircle}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                size="lg"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Need help filling out this form?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Be specific about the issue you're experiencing</li>
                  <li>Include any error messages you've received</li>
                  <li>Mention steps you've already tried</li>
                  <li>For urgent issues, consider calling the IT helpdesk directly</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;