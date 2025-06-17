import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setErrors(result.errors || {});
      if (result.message && !result.errors) {
        setErrors({ general: result.message });
      }
    }
    
    setIsLoading(false);
  };
  return (
    <div className="glass rounded-2xl p-8 shadow-2xl fade-in">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)'}}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 text-shadow">Welcome Back</h2>
        <p className="text-white text-opacity-80">Sign in to your account</p>
      </div>        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.general}
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="form-label text-white">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`form-input ${errors.email ? 'border-red-500 ring-red-200' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-300 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>
            
          <div>
            <label htmlFor="password" className="form-label text-white">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={`form-input ${errors.password ? 'border-red-500 ring-red-200' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-300 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Signing In...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white border-opacity-20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white text-opacity-80">New to our platform?</span>
            </div>
          </div>
          
          <button
            onClick={onToggleForm}
            className="mt-4 text-white text-opacity-90 hover:text-white font-semibold underline decoration-2 underline-offset-4 hover:decoration-blue-400 transition-all duration-200"
          >
            Create an account
          </button>
        </div>

        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
          <p className="text-sm text-white text-opacity-80 mb-2 font-semibold">Demo Credentials:</p>
          <p className="text-xs text-white text-opacity-70">Email: admin@example.com</p>
          <p className="text-xs text-white text-opacity-70">Password: password</p>
        </div>
      </div>
    );
  };

  export default LoginForm;
