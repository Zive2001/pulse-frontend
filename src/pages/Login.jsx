import React, { useState, useEffect } from 'react';
import { LogIn, ArrowRight, Building2, Lightbulb, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Microsoft icon component
  const MicrosoftIcon = () => (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1h10v10H1z" fill="#f25022"/>
      <path d="M12 1h10v10H12z" fill="#00a4ef"/>
      <path d="M1 12h10v10H1z" fill="#ffb900"/>
      <path d="M12 12h10v10H12z" fill="#7fba00"/>
    </svg>
  );

  // Array of images to cycle through
  const images = [
    '/digital-nomad.svg',
    '/man-riding-a-rocket.svg',
    '/remote-work.svg',
    '/home-office.svg'
  ];

  // Image rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleAzureLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate login process - replace with actual auth logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Login successful');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalInitiativeClick = () => {
    window.open('https://apps.powerapps.com/play/e/default-852c5799-8134-4f15-9d38-eba4296cc76f/a/3af613ce-f679-43a3-8983-61e5f3b80726?tenantId=852c5799-8134-4f15-9d38-eba4296cc76f&hint=b9e9bd47-9103-4425-a769-5ba85bb82b5d&sourcetime=1753326943421&source=portal&hidenavbar=true', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Top Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-base sm:text-xl text-gray-700 mb-1">
            Welcome back to,
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#E87A0B] via-[#F68009] via-[#FFA004] to-[#FFB601] bg-clip-text text-transparent">
              Digital
            </span>{" "}
            <span className="bg-gradient-to-r from-black via-gray-800 to-gray-700 bg-clip-text text-transparent">
              Pulse
            </span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg">
            Raise and track support tickets for all your digital system needs
          </p>
        </div>

        {/* Digital Initiative CTA - Minimal Design */}
        <div className="flex justify-center mb-8">
          <motion.div 
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-w-lg w-full"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lightbulb className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">
                  Have a groundbreaking digital initiative in mind?
                </span>
              </div>
              <button
                onClick={handleDigitalInitiativeClick}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors whitespace-nowrap ml-4"
              >
                <span>Share Your Vision</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Illustration */}
          <div className="flex-shrink-0 order-1 lg:order-none">
            <div className="w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt="Digital workspace illustration"
                  className="w-full h-full object-contain absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Sign In Form */}
          <div className="w-full max-w-sm order-2 lg:order-none">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Sign In</h2>
                <p className="text-xs sm:text-sm text-gray-600">Sign in with your MAS Holdings account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Azure AD Login Button */}
              <motion.button
                onClick={handleAzureLogin}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">Signing in...</span>
                  </>
                ) : (
                  <>
                    <MicrosoftIcon />
                    <span className="text-sm sm:text-base">Sign in with Microsoft</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </motion.button>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Need help?{' '}
                  <a 
                    href="mailto:bodylineanalytics@masholdings.com" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-12 lg:mt-16 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-gray-400">
            <span>✓ Secure Microsoft Login</span>
            <span>✓ Real-time Updates</span>
            <span>✓ Track your Tickets at one place</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;