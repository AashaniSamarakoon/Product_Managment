import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MinimalApp = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Register form state
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  // Products state
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', description: '' });

  const API_URL = 'http://localhost:5000/api';

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`);
      setUser(response.data.user);
      setIsAuthenticated(true);
      fetchProducts();
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setProducts([]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/products`, newProduct);
      setProducts([...products, response.data.product]);
      setNewProduct({ title: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // If authenticated, show products page
  if (isAuthenticated) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '30px',
            color: 'white'
          }}>
            <h1>Product Management</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span>Welcome, {user?.name}</span>
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: '8px 16px', 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Add Product Button */}
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ 
                padding: '12px 24px', 
                background: '#2563eb', 
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {showAddForm ? 'Cancel' : 'Add New Product'}
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '20px', 
              borderRadius: '12px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <h3>Add New Product</h3>
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                  type="text" 
                  placeholder="Product Title" 
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  required
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    outline: 'none'
                  }} 
                />
                <textarea 
                  placeholder="Product Description" 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  required
                  rows="3"
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    outline: 'none',
                    resize: 'vertical'
                  }} 
                />
                <button 
                  type="submit"
                  style={{ 
                    padding: '12px', 
                    background: '#059669', 
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Add Product
                </button>
              </form>
            </div>
          )}

          {/* Products Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {products.map(product => (
              <div key={product.id} style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                color: 'white'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{product.title}</h3>
                <p style={{ margin: '0 0 15px 0', opacity: '0.9' }}>{product.description}</p>
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  style={{ 
                    padding: '8px 16px', 
                    background: '#dc2626', 
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: 'white', 
              opacity: '0.7',
              marginTop: '60px'
            }}>
              <p>No products yet. Add your first product!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Login/Register page
  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Product Management</h1>
        
        {error && (
          <div style={{ 
            background: 'rgba(220, 38, 38, 0.2)', 
            border: '1px solid rgba(220, 38, 38, 0.5)',
            padding: '10px', 
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#fca5a5'
          }}>
            {error}
          </div>
        )}
        
        {showLogin ? (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '30px', 
            borderRadius: '12px',
            marginTop: '40px'
          }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="email" 
                placeholder="Email (try: admin@example.com)" 
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="password" 
                placeholder="Password (try: password)" 
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <button 
                type="submit"
                disabled={loading}
                style={{ 
                  padding: '12px', 
                  background: loading ? '#6b7280' : '#2563eb', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p style={{ marginTop: '20px' }}>
              Don't have an account?{' '}
              <button 
                onClick={() => setShowLogin(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#93c5fd', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        ) : (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '30px', 
            borderRadius: '12px',
            marginTop: '40px'
          }}>
            <h2>Register</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                required
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                required
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <button 
                type="submit"
                disabled={loading}
                style={{ 
                  padding: '12px', 
                  background: loading ? '#6b7280' : '#059669', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <p style={{ marginTop: '20px' }}>
              Already have an account?{' '}
              <button 
                onClick={() => setShowLogin(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#93c5fd', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Product Management</h1>
        
        {showLogin ? (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '30px', 
            borderRadius: '12px',
            marginTop: '40px'
          }}>
            <h2>Login</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="email" 
                placeholder="Email" 
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <button 
                type="submit"
                style={{ 
                  padding: '12px', 
                  background: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            </form>
            <p style={{ marginTop: '20px' }}>
              Don't have an account?{' '}
              <button 
                onClick={() => setShowLogin(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'white', 
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        ) : (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '30px', 
            borderRadius: '12px',
            marginTop: '40px'
          }}>
            <h2>Register</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Full Name" 
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="email" 
                placeholder="Email" 
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  outline: 'none'
                }} 
              />
              <button 
                type="submit"
                style={{ 
                  padding: '12px', 
                  background: '#9333ea', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Create Account
              </button>
            </form>
            <p style={{ marginTop: '20px' }}>
              Already have an account?{' '}
              <button 
                onClick={() => setShowLogin(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'white', 
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalApp;
