import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building, Calendar, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/authapis/authapis.tsx';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Form validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    if (isLogin) {
      if (!loginForm.email || !loginForm.password) {
        setError('Please fill in all fields');
        return false;
      }
      if (!validateEmail(loginForm.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else {
      if (!signupForm.name || !signupForm.email || !signupForm.password) {
        setError('Please fill in all fields');
        return false;
      }
      if (!validateEmail(signupForm.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!validatePassword(signupForm.password)) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login(loginForm);
        if (response.success) {
          authAPI.storeAuthData(response.data.user, response.data.token);
          setSuccess('Login successful! Redirecting...');
          
          // Fetch latest user data including hasApplicationCreated
          try {
            const userResponse = await authAPI.getCurrentUser();
            if (userResponse.success) {
              authAPI.storeAuthData(userResponse.data.user, response.data.token);
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
          
          // Check if user has created an application and redirect accordingly
          setTimeout(() => {
            const hasCreated = authAPI.getHasApplicationCreated();
            if (hasCreated) {
              navigate('/applications');
            } else {
              navigate('/dashboard');
            }
          }, 1500);
        }
      } else {
        const response = await authAPI.signup(signupForm);
        if (response.success) {
          authAPI.storeAuthData(response.data.user, response.data.token);
          setSuccess('Account created successfully! Redirecting...');
          // New users always go to dashboard to create their first application
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({ ...prev, [name]: value }));
  };

  // Clear messages when switching between login/signup
  const handleToggle = (login: boolean) => {
    setIsLogin(login);
    setError(null);
    setSuccess(null);
    setLoginForm({ email: '', password: '' });
    setSignupForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        
        {/* Left Panel - Branding */}
        <div className={`hidden md:flex flex-col justify-between p-12 text-white bg-gradient-to-br from-purple-600 to-indigo-700 ${!isLogin ? 'order-last' : ''}`}>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Briefcase className="w-10 h-10" />
              <h1 className="text-3xl font-bold">InternTrack</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {isLogin ? 'Welcome Back!' : 'Start Your Journey'}
            </h2>
            <p className="text-lg text-purple-100 mb-8">
              {isLogin 
                ? 'Track every internship application in one place. Stay organized, stay ahead.'
                : 'Join thousands of students landing dream internships with smart tracking.'
              }
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <span>Track 100+ applications</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span>Never miss a deadline</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-purple-200">
            <p>© 2025 InternTrack. Made for ambitious interns.</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Toggle */}
            <div className="flex mb-8 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => handleToggle(true)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  isLogin 
                    ? 'bg-white text-purple-700 shadow-md' 
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleToggle(false)}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  !isLogin 
                    ? 'bg-white text-purple-700 shadow-md' 
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Title */}
            <h3 className="text-2xl font-bold text-white mb-6">
              {isLogin ? 'Login to Your Account' : 'Create Your Account'}
            </h3>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field for signup */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={isLogin ? loginForm.email : signupForm.email}
                  onChange={isLogin ? handleLoginChange : handleSignupChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={isLogin ? loginForm.password : signupForm.password}
                    onChange={isLogin ? handleLoginChange : handleSignupChange}
                    className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <p className="text-center text-sm text-gray-400 mb-4">
                Or continue with
              </p>
              <div className="flex gap-3 justify-center">
                <button className="p-3 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-all">
                  <img src="/api/placeholder/24/24" alt="Google" className="w-6 h-6" />
                </button>
                <button className="p-3 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-all">
                  <img src="/api/placeholder/24/24" alt="LinkedIn" className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Mobile Toggle Text */}
            <p className="mt-8 text-center text-sm text-gray-400 md:hidden">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => handleToggle(!isLogin)}
                className="text-purple-400 hover:text-purple-300 font-medium underline"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;