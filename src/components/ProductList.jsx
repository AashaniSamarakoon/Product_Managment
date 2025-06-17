import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const { logout, user } = useAuth();
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          [name]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, formData);
        showNotification('Product updated successfully!');
      } else {
        await axios.post(`${API_URL}/products`, formData);
        showNotification('Product created successfully!');
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      const serverErrors = error.response?.data?.errors || {};
      setFormErrors(serverErrors);
      if (!Object.keys(serverErrors).length) {
        showNotification('Failed to save product. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      image: product.image || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      showNotification('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Failed to delete product. Please try again.', 'error');
    }
  };
  const resetForm = () => {
    setFormData({ title: '', description: '', image: '' });
    setFormErrors({});
    setEditingProduct(null);
    setShowAddForm(false);
  };  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean white background with subtle pattern */}      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Manager</h1>
                <p className="text-gray-600 text-sm">Welcome back, {user?.name || 'User'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg slide-up ${
            notification.type === 'success' 
              ? 'bg-green-500 bg-opacity-90 text-white' 
              : 'bg-red-500 bg-opacity-90 text-white'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.message}
            </div>
          </div>
        )}

        {/* Add Product Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </button>
        </div>        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 text-center fade-in shadow-lg border border-gray-200">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <div className="absolute inset-0 h-12 w-12 border-4 border-purple-500 border-b-transparent rounded-full mx-auto animate-spin animation-delay-150"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Products...</h2>
            <p className="text-gray-600">Please wait while we fetch your products</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-2xl p-8 text-center fade-in shadow-lg border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={fetchProducts} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center fade-in shadow-lg border border-gray-200">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'}}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Products Yet</h2>
                <p className="text-gray-600 mb-6">Start by adding your first product to get organized</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Product
                </button>
              </div>            ) : (
              products.map((product) => (
                <div key={product.id} className="group card fade-in hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-white shadow-lg hover:shadow-xl border border-gray-200">
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    {/* Action buttons overlay */}
                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 bg-white bg-opacity-95 backdrop-blur-sm rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-white bg-opacity-95 backdrop-blur-sm rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-header bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                  </div>
                  
                  <div className="card-body bg-white">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{product.description}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                        {product.updatedAt !== product.createdAt && (
                          <span className="text-blue-600 font-medium">Updated</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}        {/* Add/Edit Product Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md slide-up shadow-2xl border border-gray-200">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 float" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'}}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-gray-600">
                  {editingProduct ? 'Update your product details' : 'Create a new product entry'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">                <div>                  <label htmlFor="title" className="form-label text-gray-700">
                    Product Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.title ? 'border-red-500 ring-red-200' : ''}`}
                    placeholder="Enter product title"
                  />                  {formErrors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div>                  <label htmlFor="image" className="form-label text-gray-700">
                    Product Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                    />                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                    >
                      {formData.image ? (
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {formData.image && (                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="mt-2 text-sm text-red-600 hover:text-red-500 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Image
                    </button>
                  )}
                </div>

                <div>                  <label htmlFor="description" className="form-label text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`form-input resize-none ${formErrors.description ? 'border-red-500 ring-red-200' : ''}`}
                    placeholder="Enter product description"
                  />                  {formErrors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        {editingProduct ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      editingProduct ? 'Update Product' : 'Create Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductList;
