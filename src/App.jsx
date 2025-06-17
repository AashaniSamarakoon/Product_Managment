import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProductList from './components/ProductList';
import ProtectedRoute from './components/ProtectedRoute';

const AuthWrapper = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Test backend connection
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };
    testBackend();
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center fade-in">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="absolute inset-0 h-12 w-12 border-4 border-purple-500 border-b-transparent rounded-full mx-auto animate-spin animation-delay-150"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-shadow">Loading...</h2>
          <p className="text-white text-opacity-80">
            Backend: <span className="font-semibold">{backendStatus}</span>
          </p>
        </div>
      </div>
    );
  }

  // Show backend connection status
  if (backendStatus === 'disconnected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md w-full fade-in">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-shadow">Connection Error</h2>
            <p className="text-white text-opacity-80 mb-4">
              Cannot connect to backend server on http://localhost:5000
            </p>
            <p className="text-sm text-white text-opacity-60">
              Please make sure the backend server is running.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary w-full"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <ProtectedRoute>
        <ProductList />
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {backendStatus === 'connected' && (
        <div className="fixed top-6 right-6 z-50 slide-up">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Backend Connected
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {showLogin ? (
          <LoginForm onToggleForm={() => setShowLogin(false)} />
        ) : (
          <RegisterForm onToggleForm={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen">
        <AuthWrapper />
      </div>
    </AuthProvider>
  );
}

export default App;
