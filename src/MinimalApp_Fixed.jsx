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
  });  // Products state
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', description: '', imageBase64: null, category: 'Electronics' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProduct, setEditProduct] = useState({ title: '', description: '', imageBase64: null, category: 'Electronics' });
  const [imagePreview, setImagePreview] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Product Categories
  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports & Fitness'];  const categoryColors = {
    'Electronics': '#667eea',
    'Fashion': '#667eea', 
    'Home & Garden': '#667eea',
    'Sports & Fitness': '#667eea'
  };
  const API_URL = 'http://localhost:5000/api';

  // Test image loading function
  const testImageLoad = async (imagePath) => {
    try {
      const response = await fetch(`http://localhost:5000${imagePath}`);
      if (response.ok) {
        console.log('✅ Image accessible:', imagePath);
        return true;
      } else {
        console.error('❌ Image not accessible:', imagePath, 'Status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing image:', imagePath, error);
      return false;
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    }
    
    // Test backend connectivity
    testBackendConnection();
  }, []);
  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await axios.get(`${API_URL}/health`);
      console.log('✅ Backend connection successful:', response.data);
      
      // Test if uploads directory is accessible
      try {
        const uploadsTest = await fetch('http://localhost:5000/uploads/products/');
        console.log('📁 Uploads directory status:', uploadsTest.status);
        if (uploadsTest.status === 403 || uploadsTest.status === 200) {
          console.log('✅ Uploads directory is accessible');
        }
      } catch (uploadError) {
        console.warn('⚠️ Could not test uploads directory:', uploadError.message);
      }
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setError('Cannot connect to server. Please check if backend is running.');
    }
  };

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
      console.log('Fetched products:', response.data.products);
      // Debug: Log image paths
      response.data.products.forEach(product => {
        if (product.image) {
          console.log(`Product "${product.title}" image path:`, product.image);
          console.log(`Full image URL: http://localhost:5000${product.image}`);
        }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting login with:', loginData);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      fetchProducts();
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Login failed');
    }
    
    setLoading(false);
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting registration with:', registerData);

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
      
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      fetchProducts();
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
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
  };  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    console.log('Attempting to add product:', newProduct);
    console.log('Current token:', localStorage.getItem('token'));
    
    // Basic validation
    if (!newProduct.title.trim()) {
      setError('Product title is required');
      return;
    }
    
    if (newProduct.title.trim().length < 3) {
      setError('Product title must be at least 3 characters long');
      return;
    }
    
    if (!newProduct.description.trim()) {
      setError('Product description is required');
      return;
    }
    
    if (newProduct.description.trim().length < 10) {
      setError('Product description must be at least 10 characters long');
      return;
    }
    
    try {
      // Convert image to base64 if present
      let imageBase64 = null;
      if (newProduct.imageFile) {
        imageBase64 = await convertToBase64(newProduct.imageFile);
      }

      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category,
        imageBase64: imageBase64
      };

      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Add product response:', response.data);
      setProducts([...products, response.data.product]);
      setNewProduct({ title: '', description: '', imageBase64: null, category: 'Electronics' });
      setImagePreview('');
      setShowAddForm(false);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to add product');
    }
  };
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    console.log('Attempting to update product:', editProduct);
    
    // Basic validation
    if (!editProduct.title.trim()) {
      setError('Product title is required');
      return;
    }
    
    if (editProduct.title.trim().length < 3) {
      setError('Product title must be at least 3 characters long');
      return;
    }
    
    if (!editProduct.description.trim()) {
      setError('Product description is required');
      return;
    }
    
    if (editProduct.description.trim().length < 10) {
      setError('Product description must be at least 10 characters long');
      return;
    }
    
    try {
      // Convert image to base64 if new image is selected
      let imageBase64 = editingProduct.imageBase64; // Keep existing image
      if (editProduct.imageFile) {
        imageBase64 = await convertToBase64(editProduct.imageFile);
      }

      const productData = {
        title: editProduct.title,
        description: editProduct.description,
        category: editProduct.category,
        imageBase64: imageBase64
      };

      const response = await axios.put(`${API_URL}/products/${editingProduct.id}`, productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Update product response:', response.data);
      
      // Update the product in the list
      setProducts(products.map(p => 
        p.id === editingProduct.id ? response.data.product : p
      ));
        setEditingProduct(null);
      setEditProduct({ title: '', description: '', imageBase64: null });
      setEditImagePreview('');
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to update product');
    }
  };
  const startEditProduct = (product) => {
    setEditingProduct(product);
    setEditProduct({ 
      title: product.title, 
      description: product.description, 
      category: product.category || 'Electronics',
      imageFile: null 
    });
    setEditImagePreview(''); // Clear preview, will show existing image if any
    setShowAddForm(false); // Close add form if open
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditProduct({ title: '', description: '', imageBase64: null });
    setEditImagePreview('');
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
    return (      <div style={{ 
        background: '#ffffff',
        minHeight: '100vh'
      }}>        {/* Header with gradient */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white'
          }}>            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ 
                fontSize: '28px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#1f2937',
                padding: '10px 14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                PM
              </span>
              Product Management
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '16px' }}>Welcome, {user?.name}</span>              <button 
                onClick={handleLogout}
                style={{ 
                  padding: '10px 20px', 
                  background: 'rgba(255,255,255,0.15)', 
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.25)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>          {/* Add Product Button */}
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                  // Cancel any ongoing edit when starting to add
                  setEditingProduct(null);
                  setEditProduct({ title: '', description: '', category: 'Electronics' });
                }
              }}              style={{ 
                padding: '14px 28px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {showAddForm ? '✕ Cancel' : '+ Add New Product'}
            </button>
          </div>          {/* Product Categories Section */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ 
                color: '#1f2937', 
                fontSize: '32px', 
                fontWeight: '800',
                marginBottom: '12px'
              }}>
                Product Categories
              </h2>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '18px',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Explore our products organized across 4 main categories. Click on any category to view products or browse all.
              </p>
            </div>            {/* Category Filter Cards */}
            <div style={{ 
              display: 'flex',
              gap: '16px',
              marginBottom: '30px',
              justifyContent: 'center',
              flexWrap: 'nowrap',
              overflowX: 'auto'
            }}>              <button
                onClick={() => setSelectedCategory('All')}
                style={{
                  padding: '16px 20px',
                  minWidth: '180px',
                  background: selectedCategory === 'All' 
                    ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' 
                    : '#ffffff',
                  color: selectedCategory === 'All' ? 'white' : '#374151',
                  border: selectedCategory === 'All' ? 'none' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  boxShadow: selectedCategory === 'All' 
                    ? '0 6px 20px rgba(107, 114, 128, 0.3)' 
                    : '0 3px 10px rgba(0, 0, 0, 0.06)',
                  textAlign: 'center',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: selectedCategory === 'All' ? 'translateY(-1px)' : 'none',
                  flexShrink: 0
                }}
              >                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏪</div>
                <div style={{ fontSize: '14px', marginBottom: '2px' }}>All Categories</div>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: '0.8',
                  fontWeight: '600'
                }}>
                  {products.length} products
                </div>
              </button>

              {categories.map(category => {
                const categoryCount = products.filter(p => p.category === category).length;
                const categoryIcons = {
                  'Electronics': '📱',
                  'Fashion': '👗',
                  'Home & Garden': '🏡',
                  'Sports & Fitness': '🏃‍♂️'
                };                const gradientColors = {
                  'Electronics': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'Fashion': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'Home & Garden': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'Sports & Fitness': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                };

                const shadowColors = {
                  'Electronics': 'rgba(102, 126, 234, 0.4)',
                  'Fashion': 'rgba(102, 126, 234, 0.4)',
                  'Home & Garden': 'rgba(102, 126, 234, 0.4)',
                  'Sports & Fitness': 'rgba(102, 126, 234, 0.4)'
                };

                return (                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '16px 20px',
                      minWidth: '180px',
                      background: selectedCategory === category 
                        ? gradientColors[category]
                        : '#ffffff',
                      color: selectedCategory === category ? 'white' : '#374151',
                      border: selectedCategory === category ? 'none' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      transition: 'all 0.3s',
                      boxShadow: selectedCategory === category 
                        ? `0 6px 20px ${shadowColors[category]}` 
                        : '0 3px 10px rgba(0, 0, 0, 0.06)',
                      textAlign: 'center',
                      minHeight: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: selectedCategory === category ? 'translateY(-1px)' : 'none',
                      flexShrink: 0
                    }}
                  >                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                      {categoryIcons[category]}
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>{category}</div>
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: '0.8',
                      fontWeight: '600'
                    }}>
                      {categoryCount} product{categoryCount !== 1 ? 's' : ''}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current Selection Indicator */}
            <div style={{ 
              textAlign: 'center',
              padding: '15px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>
                Currently viewing: 
              </span>              <span style={{ 
                color: selectedCategory === 'All' ? '#667eea' : categoryColors[selectedCategory],
                fontWeight: '700',
                marginLeft: '8px'
              }}>
                {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
              </span>
              <span style={{ color: '#64748b', marginLeft: '8px' }}>
                ({products.filter(product => selectedCategory === 'All' || product.category === selectedCategory).length} products)
              </span>
            </div>
          </div>

          {/* Error Display */}
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
          )}          {/* Add Product Form */}
          {showAddForm && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '35px', 
              borderRadius: '20px',
              marginBottom: '35px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Header with gradient background */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}></div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e9ecef'
              }}>
                <h3 style={{ 
                  color: '#1f2937', 
                  fontSize: '26px', 
                  fontWeight: '700',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  ➕ Add New Product
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Create Mode
                </div>
              </div>

              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Title Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📝 Product Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter product title (minimum 3 characters)" 
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                    required
                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      border: '1px solid #dee2e6', 
                      outline: 'none',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff'
                    }} 
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Description Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📄 Product Description
                  </label>
                  <textarea 
                    placeholder="Enter detailed product description (minimum 10 characters)" 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    required
                    rows="4"
                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      border: '1px solid #dee2e6', 
                      outline: 'none',
                      resize: 'vertical',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Category Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🏷️ Category
                  </label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      border: '1px solid #dee2e6', 
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Image Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📷 Product Image
                  </label>
                  
                  <div style={{
                    border: '1px dashed #ced4da',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = '#f8f9ff';
                  }}
                  onDragLeave={(e) => {
                    e.target.style.borderColor = '#ced4da';
                    e.target.style.backgroundColor = '#ffffff';
                  }}>
                    <input 
                      type="file" 
                      accept="image/*"                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Store the file temporarily for processing
                          setNewProduct({...newProduct, imageFile: file});
                          
                          // Create preview
                          const reader = new FileReader();
                          reader.onload = (event) => setImagePreview(event.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ 
                        width: '100%',
                        padding: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280'
                      }} 
                    />
                    <p style={{
                      margin: '8px 0 0 0',
                      color: '#9ca3af',
                      fontSize: '13px'
                    }}>
                      Drag & drop an image or click to browse
                    </p>
                  </div>

                  {imagePreview && (
                    <div style={{ 
                      textAlign: 'center',
                      padding: '15px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '150px', 
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid #dee2e6'
                        }} 
                      />
                      <br />
                      <button 
                        type="button"
                        onClick={() => {
                          setNewProduct({...newProduct, imageFile: null});
                          setImagePreview('');
                        }}
                        style={{ 
                          marginTop: '12px',
                          padding: '6px 12px', 
                          background: '#ef4444', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                      >
                        🗑️ Remove Image
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  style={{ 
                    padding: '14px 24px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    marginTop: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  ✨ Add Product
                </button>
              </form>
            </div>
          )}{/* Edit Product Form */}
          {editingProduct && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '35px', 
              borderRadius: '20px',
              marginBottom: '35px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Header with gradient background */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}></div>
                <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e9ecef'
              }}>
                <h3 style={{ 
                  color: '#1f2937', 
                  fontSize: '26px', 
                  fontWeight: '700',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  ✏️ Edit Product
                </h3>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Editing Mode
                </div>
              </div>

              <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Title Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📝 Product Title
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter product title (minimum 3 characters)" 
                    value={editProduct.title}
                    onChange={(e) => setEditProduct({...editProduct, title: e.target.value})}
                    required                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      border: '1px solid #dee2e6', 
                      outline: 'none',
                      fontSize: '15px',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff'
                    }} 
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Description Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📄 Product Description
                  </label>
                  <textarea 
                    placeholder="Enter detailed product description (minimum 10 characters)" 
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                    required
                    rows="4"                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      border: '1px solid #dee2e6', 
                      outline: 'none',
                      resize: 'vertical',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      backgroundColor: '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Category Selection for Edit */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🏷️ Category
                  </label>
                  <select 
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '12px', 
                      border: '1px solid #dee2e6', 
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#dee2e6';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Image Upload for Edit */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ 
                    color: '#374151', 
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📷 Product Image
                  </label>
                    <div style={{
                    border: '1px dashed #ced4da',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = '#f8f9ff';
                  }}
                  onDragLeave={(e) => {
                    e.target.style.borderColor = '#ced4da';
                    e.target.style.backgroundColor = '#ffffff';
                  }}>
                    <input 
                      type="file" 
                      accept="image/*"                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Store the file temporarily for processing
                          setEditProduct({...editProduct, imageFile: file});
                          
                          // Create preview
                          const reader = new FileReader();
                          reader.onload = (event) => setEditImagePreview(event.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ 
                        width: '100%',
                        padding: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280'
                      }} 
                    />
                    <p style={{
                      margin: '8px 0 0 0',
                      color: '#9ca3af',
                      fontSize: '13px'
                    }}>
                      Drag & drop an image or click to browse
                    </p>
                  </div>
                    {(editImagePreview || editingProduct?.imageBase64 || editingProduct?.image) && (
                    <div style={{ 
                      textAlign: 'center',
                      padding: '15px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <img 
                        src={editImagePreview || editingProduct?.imageBase64 || `http://localhost:5000${editingProduct.image}`} 
                        alt="Preview"
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '150px',                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid #dee2e6'
                        }} 
                      />
                      <br />
                      <button 
                        type="button"
                        onClick={() => {
                          setEditProduct({...editProduct, imageFile: null});
                          setEditImagePreview('');
                        }}
                        style={{ 
                          marginTop: '12px',
                          padding: '6px 12px', 
                          background: '#ef4444', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                      >
                        🗑️ Remove Image
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '15px',
                  marginTop: '10px'
                }}>
                  <button 
                    type="submit"
                    style={{ 
                      padding: '14px 24px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '15px',
                      flex: 1,
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    ✨ Update Product
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    style={{ 
                      padding: '14px 24px', 
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                      flex: 1,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}{/* Products Section */}
          <div style={{ marginBottom: '40px' }}>
            {/* Section Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h3 style={{ 
                color: '#111827', 
                fontSize: '22px', 
                fontWeight: '700',
                margin: '0'
              }}>
                {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
              </h3>              <div style={{ 
                background: selectedCategory === 'All' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : categoryColors[selectedCategory] || '#6b7280',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {products.filter(product => selectedCategory === 'All' || product.category === selectedCategory).length} items
              </div>
            </div>

            {/* Products Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '24px' 
            }}>
              {products
                .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
                .map(product => (
                <div key={product.id} style={{ 
                  background: '#ffffff', 
                  padding: '24px', 
                  borderRadius: '16px',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                }}
                >
                  {/* Category Badge - Enhanced */}
                  <div style={{ 
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    background: categoryColors[product.category] || '#6b7280',
                    color: 'white',
                    padding: '8px 16px',
                    borderBottomLeftRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {product.category || 'Uncategorized'}
                  </div>                  {/* Product Image */}
                  {(product.imageBase64 || product.image) ? (
                    <div style={{ 
                      marginBottom: '20px', 
                      marginTop: '15px',
                      textAlign: 'center',
                      backgroundColor: '#f9fafb',
                      padding: '15px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <img 
                        src={product.imageBase64 || `http://localhost:5000${product.image}`}
                        alt={product.title}
                        onError={(e) => {
                          console.error('❌ Image failed to load for product:', product.title);
                          console.error('  - Image source:', e.target.src);
                          
                          // Hide the broken image and show fallback
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                        onLoad={(e) => {
                          console.log('✅ Image loaded successfully for product:', product.title);
                          // Hide fallback if image loads
                          const fallback = e.target.nextElementSibling;
                          if (fallback) {
                            fallback.style.display = 'none';
                          }
                        }}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '220px', 
                          width: '100%',
                          height: '220px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid #e5e7eb',
                          display: 'block'
                        }} 
                      />
                      {/* Fallback for failed images */}
                      <div style={{ 
                        display: 'none',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '220px',
                        color: '#9ca3af',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ 
                          fontSize: '48px', 
                          marginBottom: '12px',
                          opacity: '0.5'
                        }}>
                          🖼️
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280'
                        }}>
                          Image not available
                        </div>
                        <div style={{ 
                          fontSize: '12px',
                          color: '#9ca3af',
                          marginTop: '4px'
                        }}>
                          Failed to load image
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      marginBottom: '20px', 
                      marginTop: '15px',
                      textAlign: 'center',
                      backgroundColor: '#f9fafb',
                      padding: '50px 15px',
                      borderRadius: '12px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ 
                        fontSize: '56px', 
                        opacity: '0.3',
                        marginBottom: '12px'
                      }}>
                        🖼️
                      </div>                      <div style={{ 
                        color: '#9ca3af', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        No image uploaded
                      </div>
                    </div>
                  )}

                  {/* Product Details */}
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    color: '#111827', 
                    fontSize: '20px', 
                    fontWeight: '700',
                    lineHeight: '1.3'
                  }}>
                    {product.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 20px 0', 
                    color: '#6b7280', 
                    lineHeight: '1.6',
                    fontSize: '15px'
                  }}>
                    {product.description}
                  </p>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>                    <button 
                      onClick={() => startEditProduct(product)}
                      style={{ 
                        padding: '6px 12px', 
                        background: '#64748b', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        flex: 1,
                        fontWeight: '600',
                        fontSize: '12px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#475569'}
                      onMouseLeave={(e) => e.target.style.background = '#64748b'}
                    >
                      ✏️ Edit
                    </button>                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      style={{ 
                        padding: '6px 12px', 
                        background: '#e11d48', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        flex: 1,
                        fontWeight: '600',
                        fontSize: '12px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#be185d'}
                      onMouseLeave={(e) => e.target.style.background = '#e11d48'}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {products.filter(product => selectedCategory === 'All' || product.category === selectedCategory).length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                marginTop: '60px',
                padding: '60px 40px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '20px',
                border: '2px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px', opacity: '0.4' }}>
                  {selectedCategory === 'All' ? '📦' : 
                   selectedCategory === 'Electronics' ? '📱' :
                   selectedCategory === 'Fashion' ? '👗' :
                   selectedCategory === 'Home & Garden' ? '🏡' :
                   selectedCategory === 'Sports & Fitness' ? '🏃‍♂️' : '📦'
                  }
                </div>
                <h3 style={{ 
                  color: '#374151', 
                  marginBottom: '12px',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  No products found
                </h3>
                <p style={{ 
                  fontSize: '16px',
                  lineHeight: '1.5',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  {selectedCategory === 'All' 
                    ? 'Add your first product to get started!' 
                    : `No products in ${selectedCategory} category yet. Add some products to this category!`
                  }
                </p>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      marginTop: '20px',
                      padding: '12px 24px',
                      background: categoryColors[selectedCategory] || '#f97316',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Add {selectedCategory} Product
                  </button>                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }  // Login/Register page
  return (
    <div style={{ 
      background: `url('https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'    }}>      <div style={{ 
        maxWidth: '450px', 
        margin: '0 auto', 
        padding: '20px 20px'
      }}>        {/* Logo and Title Section */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '25px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ 
              fontSize: '28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              PM
            </span>            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              margin: '0',
              color: '#1f2937'
            }}>
              Product Management
            </h1>
          </div>          <p style={{ 
            margin: '0',
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Welcome! Please sign in to continue
          </p>
        </div>
        
        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca',
            padding: '12px', 
            borderRadius: '10px',
            marginBottom: '20px',
            color: '#dc2626',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}
          {showLogin ? (          <div style={{ 
            background: '#ffffff', 
            padding: '25px', 
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              color: '#1f2937',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '6px',
              textAlign: 'center'
            }}>
              Welcome Back
            </h2>
            <p style={{ 
              color: '#6b7280',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              Sign in to your account
            </p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="email" 
                placeholder="Email (try: admin@example.com)" 
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                style={{ 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '2px solid #e5e7eb', 
                  outline: 'none',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  color: '#374151'
                }} 
              />
              <input 
                type="password" 
                placeholder="Password (try: password)" 
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                style={{ 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '2px solid #e5e7eb', 
                  outline: 'none',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  color: '#374151'
                }} 
              />
              <button 
                type="submit"
                disabled={loading}                style={{ 
                  padding: '16px',                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Signing in...' : '🔐 Sign In'}
              </button>
            </form>            <p style={{ 
              marginTop: '15px', 
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Don't have an account?{' '}              <button 
                onClick={() => setShowLogin(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#8b5cf6', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Create Account
              </button>
            </p>
          </div>        ) : (
          <div style={{ 
            background: '#ffffff', 
            padding: '25px', 
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              color: '#1f2937',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '6px',
              textAlign: 'center'
            }}>
              Create Account
            </h2>
            <p style={{ 
              color: '#6b7280',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              Join us to manage your products
            </p>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}><input 
                type="text" 
                placeholder="Full Name" 
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                required
                style={{ 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '2px solid #e5e7eb', 
                  outline: 'none',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  color: '#374151'
                }} 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
                style={{ 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '2px solid #e5e7eb', 
                  outline: 'none',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  color: '#374151'
                }} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
                style={{ 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '2px solid #e5e7eb', 
                  outline: 'none',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  color: '#374151'
                }} 
              />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                required
                style={{ 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '2px solid #e5e7eb', 
                  outline: 'none',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  color: '#374151'
                }} 
              />              <button 
                type="submit"
                disabled={loading}
                style={{ 
                  padding: '12px', 
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Creating Account...' : '🚀 Create Account'}
              </button>
            </form>
            <p style={{ 
              marginTop: '15px', 
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Already have an account?{' '}              <button 
                onClick={() => setShowLogin(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#8b5cf6', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalApp;
