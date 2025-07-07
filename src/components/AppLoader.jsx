import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import ecgLoader from '../assets/ecg-loader.json'; // Update the path accordingly

const AppLoader = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-6">
            {/* Lottie ECG animation */}
            <Lottie animationData={ecgLoader} loop className="w-64 h-24 mx-auto" />

            {/* Brand */}
            <h1 className="text-2xl font-semibold text-gray-900">Bodyline Digital</h1>
            <h2 className="text-blue-600 tracking-wide">Pulse</h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppLoader;
