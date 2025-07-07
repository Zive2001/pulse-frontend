import toast from 'react-hot-toast';

export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    duration: 5000,
    ...options,
  });
};

export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    duration: 6000,
    ...options,
  });
};

export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    duration: Infinity,
    ...options,
  });
};

export const showInfoToast = (message, options = {}) => {
  return toast(message, {
    icon: 'ℹ️',
    duration: 4000,
    ...options,
  });
};

export const showWarningToast = (message, options = {}) => {
  return toast(message, {
    icon: '⚠️',
    duration: 5000,
    ...options,
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const dismissAllToasts = () => {
  toast.dismiss();
};