import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            maxWidth: '90vw',
            minWidth: '280px',
            wordWrap: 'break-word',
            textAlign: 'left',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#6b7280',
              secondary: '#fff',
            },
          },
        }}
        containerStyle={{
          top: '80px', // Account for mobile navigation button
          left: '16px',
          right: '16px',
        }}
        containerClassName="toast-container"
      />
      
      {/* Custom CSS for mobile responsiveness */}
      <style jsx global>{`
        .toast-container {
          z-index: 9999;
        }
        
        @media (max-width: 768px) {
          .toast-container {
            top: 70px !important;
            left: 12px !important;
            right: 12px !important;
          }
          
          .toast-container > div {
            max-width: calc(100vw - 24px) !important;
            min-width: auto !important;
            margin: 0 auto;
          }
          
          .toast-container [data-hot-toast] {
            max-width: 100% !important;
            font-size: 13px !important;
            padding: 10px 14px !important;
            line-height: 1.4;
          }
        }
        
        @media (max-width: 480px) {
          .toast-container {
            top: 65px !important;
            left: 8px !important;
            right: 8px !important;
          }
          
          .toast-container [data-hot-toast] {
            font-size: 12px !important;
            padding: 8px 12px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ToastProvider;