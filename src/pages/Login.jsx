import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Top Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-l text-gray-700 mb-1">
            Welcome back to,
          </h1>
          <h2 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#E87A0B] via-[#F68009] via-[#FFA004] to-[#FFB601] bg-clip-text text-transparent">
              Bodyline
            </span>{" "}
            <span className="bg-gradient-to-r from-black via-gray-800 to-gray-700 bg-clip-text text-transparent">
              Pulse
            </span>
          </h2>
          <p className="text-gray-600 text-lg">
            Raise and track support tickets for all your digital system needs
          </p>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center gap-16">
          {/* Illustration */}
          <div className="hidden lg:block flex-shrink-0">
            <img 
              src="/digital-nomad.svg" 
              alt="Digital workspace illustration" 
              className="w-80 h-80 object-contain"
            />
          </div>

          {/* Sign In Form */}
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign In</h2>
                <p className="text-sm text-gray-600">Sign in with your MAS Holdings account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Azure AD Login Button */}
              <button
                onClick={handleAzureLogin}
                disabled={loading}
                className="w-full bg-[#0078d4] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#106ebe] focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Sign in with Microsoft
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>

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
        <div className="mt-16 text-center">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
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