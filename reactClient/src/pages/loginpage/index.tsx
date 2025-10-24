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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* Left Panel - Branding */}
        <div className={`hidden md:flex flex-col justify-between p-12 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 ${!isLogin ? 'order-last' : ''} relative overflow-hidden`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Briefcase className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">InternTrack</h1>
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              {isLogin ? 'Welcome Back!' : 'Start Your Journey'}
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              {isLogin 
                ? 'Track every internship application in one place. Stay organized, stay ahead.'
                : 'Join thousands of students landing dream internships with smart tracking.'
              }
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Track 100+ applications</div>
                  <div className="text-white/80 text-sm">Never lose track of your progress</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Never miss a deadline</div>
                  <div className="text-white/80 text-sm">Smart reminders and notifications</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-sm text-white/70">
            <p>© 2025 InternTrack. Made for ambitious interns.</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-sm">
          <div className="max-w-md mx-auto w-full">
            {/* Toggle */}
            <div className="flex mb-8 bg-white/10 backdrop-blur-sm p-1 rounded-2xl border border-white/20">
              <button
                onClick={() => handleToggle(true)}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  isLogin 
                    ? 'bg-white text-purple-700 shadow-lg transform scale-105' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleToggle(false)}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-white text-purple-700 shadow-lg transform scale-105' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Title */}
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h3>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-100 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl text-green-100 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {success}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field for signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-white/90 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={isLogin ? loginForm.email : signupForm.email}
                  onChange={isLogin ? handleLoginChange : handleSignupChange}
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={isLogin ? loginForm.password : signupForm.password}
                    onChange={isLogin ? handleLoginChange : handleSignupChange}
                    className="w-full px-5 py-4 pr-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
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
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  <span className="text-lg">{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/60">Or continue with</span>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded"></div>
                </button>
                <button className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded"></div>
                </button>
              </div>
            </div>

            {/* Mobile Toggle Text */}
            <p className="mt-8 text-center text-sm text-white/70 md:hidden">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => handleToggle(!isLogin)}
                className="text-purple-300 hover:text-purple-200 font-semibold underline transition-colors duration-200"
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