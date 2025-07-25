import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Download,
  Maximize2,
  X,
  CheckCircle,
  Circle
} from 'lucide-react';

const UserGuide = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  // Guide steps data
  const guideSteps = [
    {
      id: 1,
      title: "Welcome to the Platform",
      description: "Get started with our comprehensive ticketing system. This guide will walk you through all the essential features and functionalities.",
      image: "1.svg",
      details: [
        "Dashboard overview and navigation",
        "User Actions and Quick Links",
        "Getting oriented with the interface"
      ]
    },
    {
      id: 2,
      title: "Login and Authentication",
      description: "Securely log in to the platform using your corporate credentials. Use quick links for support and resources.",
      image: "2.svg",
      details: [
        "Secure login process",
        "Accessing support resources",
        
      ]
    },
   
    {
      id: 3,
      title: "Managing Your Tickets",
      description: "View, track, and manage all your submitted tickets in one centralized location.",
      image: "3.svg",
      details: [
        "Viewing ticket status",
        "View your recent tickets",
        "Qucik Actions and Navigation",
      ]
    },
 
     {
      id: 4,
      title: "Creating Your First Ticket",
      description: "Learn how to create a new support ticket with all the necessary information to get quick resolution.",
      image: "4.svg",
      details: [
        "Filling out ticket forms",
        "Setting priority levels",
        "Selecting categories and subcategories",
      ]
    },
       {
      id: 5,
      title: "Track your Ticket",
      description: "All your tickets will appear here. Easy access for tracking and managing.",
      image: "5.svg",
      details: [
        "View details of each ticket",
        "Filter or search tickets   ",
      
      ]
    },
    {
      id: 6,
      title: "Ticket detail view and communication",
      description: "Ticket status update and detail view happens here.",
      image: "6.svg",
      details: [
        "View History of the ticket",
        "Ticket status updates",
        
      ]
    },
    {
      id: 7,
      title: "Tips & Best Practices",
      description: "Learn best practices to maximize efficiency and get the most out of the platform.",
      image: "7.svg",
      details: [
        "Writing effective ticket descriptions",
        "Using the right priority levels",
        "Following up appropriately"
      ]
    }
  ];

  // Auto-play functionality
  React.useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % guideSteps.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, guideSteps.length]);

  // Navigation functions
  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % guideSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + guideSteps.length) % guideSteps.length);
  };

  const goToStep = (index) => {
    setCurrentStep(index);
  };

  const resetGuide = () => {
    setCurrentStep(0);
    setAutoPlay(false);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b border-gray-200"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#fb8500' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <BookOpen className="w-5 h-5 text-white" />
                </motion.div>
                <h1 className="text-xl font-semibold text-gray-900">User Guide</h1>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`p-2 rounded-lg transition-colors ${
                  autoPlay 
                    ? 'text-white hover:opacity-90' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                style={autoPlay ? { backgroundColor: '#fb8500' } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={autoPlay ? 'Pause auto-play' : 'Start auto-play'}
              >
                {autoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </motion.button>

              <motion.button
                onClick={resetGuide}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset guide"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Toggle fullscreen"
              >
                {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {guideSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / guideSteps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="h-2 rounded-full"
              style={{ backgroundColor: '#001219' }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Step Indicators */}
        <motion.div 
          className="flex justify-center mb-8"
          variants={itemVariants}
        >
          <div className="flex space-x-2">
            {guideSteps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? ''
                    : index < currentStep
                    ? ''
                    : 'bg-gray-300'
                }`}
                style={
                  index === currentStep 
                    ? { backgroundColor: '#fb8500' }
                    : index < currentStep
                    ? { backgroundColor: '#001219' }
                    : {}
                }
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <AnimatePresence mode="wait" custom={1}>
                  <motion.div
                    key={currentStep}
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <img
                      src={`/${guideSteps[currentStep].image}`}
                      alt={guideSteps[currentStep].title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 hidden"
                      style={{display: 'none'}}
                    >
                      <div className="text-center">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">{guideSteps[currentStep].title}</p>
                        <p className="text-sm text-gray-400 mt-2">Image placeholder</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <motion.button
                    onClick={prevStep}
                    className="ml-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <motion.button
                    onClick={nextStep}
                    className="mr-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fb8500', opacity: 0.1 }}>
                      <span className="text-sm font-semibold" style={{ color: '#fb8500' }}>
                        {currentStep + 1}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {guideSteps[currentStep].title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {guideSteps[currentStep].description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                      What you'll learn:
                    </h3>
                    <ul className="space-y-2">
                      {guideSteps[currentStep].details.map((detail, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-600"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </motion.button>

                <motion.button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#fb8500' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{currentStep === guideSteps.length - 1 ? 'Restart' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  onClick={() => navigate('/create-ticket')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#001219' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Creating a Ticket
                </motion.button>
                <motion.button
                  onClick={() => navigate('/my-tickets')}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View My Tickets
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserGuide;