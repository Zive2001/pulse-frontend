import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, LogIn, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email.trim());
      
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

  const handleExampleLogin = async (exampleEmail) => {
    setEmail(exampleEmail);
    setError('');
    setLoading(true);

    try {
      const result = await login(exampleEmail);
      
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

  const exampleAccounts = [
    { email: 'manager@masholdings.com', role: 'Manager', color: 'bg-purple-100 text-purple-700' },
    { email: 'digital.team@masholdings.com', role: 'Digital Team', color: 'bg-blue-100 text-blue-700' },
    { email: 'user@masholdings.com', role: 'General User', color: 'bg-green-100 text-green-700' },
    { email: 'supunse@masholdings.com', role: 'Admin', color: 'bg-green-100 text-green-700' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Top Greeting */}
        <div className="text-center mb-12">
    <h1 className="text-l text-gray-700 mb-1">
  Welcome back to ,
</h1>
<h2 className="text-4xl font-bold tracking-tight">
  <span
    className="bg-gradient-to-r from-[#E87A0B] via-[#F68009] via-[#FFA004] to-[#FFB601] bg-clip-text text-transparent"
  >
    Bodyline
  </span>{" "}
  <span
    className="bg-gradient-to-r from-black via-gray-800 to-gray-700 bg-clip-text text-transparent"
  >
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
                <p className="text-sm text-gray-600">Enter your email to access your account</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@masholdings.com"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        error 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 bg-white'
                      }`}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
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
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-6">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                >
                  <span>Try demo accounts</span>
                  {showExamples ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </button>

                {showExamples && (
                  <div className="mt-4 space-y-2">
                    {exampleAccounts.map((account, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleLogin(account.email)}
                        disabled={loading}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${account.color} mb-1`}>
                              {account.role}
                            </span>
                            <p className="text-xs text-gray-500 font-mono">{account.email}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Need help?{' '}
                  <a 
                    href="bodylineanalytics@masholdings.com" 
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
            <span>✓ Secure Access</span>
            <span>✓ Real-time Updates</span>
            <span>✓ Role-based Permissions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;