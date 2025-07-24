import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowRight, Building2, Lightbulb, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

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
      const result = await login();
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalInitiativeClick = () => {
    window.open('https://apps.powerapps.com/play/e/default-852c5799-8134-4f15-9d38-eba4296cc76f/a/4bcfce34-5365-4a4c-9b06-bbc9e5127c5c?tenantId=852c5799-8134-4f15-9d38-eba4296cc76f&hint=052d3a0c-1e98-41aa-9cb6-04c5f35a490c&sourcetime=1753326943424&source=portal&hidenavbar=true', '_blank');
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

              {/* Help Text & Digital Initiative CTA */}
              <div className="mt-6 space-y-4">
                {/* Help Text */}
                <div className="text-center">
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

                {/* Subtle Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500">or</span>
                  </div>
                </div>

                {/* Digital Initiative CTA - Integrated Design */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <p className="text-xs text-gray-600 mb-2">
                    Have a groundbreaking digital initiative?
                  </p>
                  <button
                    onClick={handleDigitalInitiativeClick}
                    className="inline-flex items-center space-x-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors group"
                  >
                    <Lightbulb className="h-3.5 w-3.5 group-hover:animate-pulse" />
                    <span>Share Your Vision</span>
                    <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                </motion.div>
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