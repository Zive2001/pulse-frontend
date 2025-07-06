import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, LogIn, Ticket, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const handleExampleLogin = (exampleEmail) => {
    setEmail(exampleEmail);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bodyline-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-bodyline-100 rounded-xl flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-bodyline-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Bodyline Pulse
            </h1>
            <p className="text-gray-600">
              Sign in with your organization email to access the support system
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="your.email@bodyline.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              error={error}
              required
              autoComplete="email"
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              icon={LogIn}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Example Logins */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Try example accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExampleLogin('manager@masholdings.com')}
                icon={Shield}
                className="w-full justify-start"
              >
                Manager Account
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExampleLogin('digital.team@masholdings.com')}
                icon={Users}
                className="w-full justify-start"
              >
                Digital Team Member
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExampleLogin('user@bodyline.com')}
                icon={Mail}
                className="w-full justify-start"
              >
                General User
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Having trouble accessing your account?{' '}
              <a href="mailto:it-support@bodyline.com" className="text-bodyline-600 hover:text-bodyline-700">
                Contact IT Support
              </a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-sm text-gray-600 mb-4">
            Bodyline Support Portal Features:
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <span className="flex items-center">
              <Ticket className="w-4 h-4 mr-1" />
              Create Tickets
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Track Progress
            </span>
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Role-based Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;