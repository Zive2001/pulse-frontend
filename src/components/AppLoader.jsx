import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import ecgLoader from '../assets/ecg-loader.json'; // Update the path accordingly

const AppLoader = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Centered Content */}
          <div className="flex flex-col items-center space-y-6">
            {/* ECG Animation */}
            <Lottie animationData={ecgLoader} loop autoplay className="w-64 h-24" />

            {/* Brand Title */}
            <h2 className="text-xl font-bold tracking-tight text-center">
              <span className="bg-gradient-to-r from-[#E87A0B] via-[#F68009] via-[#FFA004] to-[#FFB601] bg-clip-text text-transparent">
                Bodyline
              </span>{" "}
              <span className="bg-gradient-to-r from-black via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Pulse
              </span>
            </h2>
          </div>

          {/* Footer at Bottom */}
          <div className="absolute bottom-4 text-xs text-gray-500 font-medium tracking-wide">
            © Bodyline Digital Excellence
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppLoader;
