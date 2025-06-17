import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// In-memory product storage (in production, use a database)
let products = [
  {
    id: 1,
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    category: 'Electronics',
    image: '',
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and waterproof design. Track your health and fitness goals.',
    category: 'Sports & Fitness',
    image: '',
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'school bag',
    description: 'asdfghj ertyjk cvbnm',
    category: 'Fashion',
    image: '',
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Validation helpers
const validateProduct = (title, description) => {
  const errors = {};
  
  if (!title || title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (title.trim().length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (!description || description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  } else if (description.trim().length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Get all products (protected route)
router.get('/', authenticateToken, (req, res) => {
  try {
    // Filter products by the authenticated user
    const userProducts = products.filter(product => product.userId === req.user.userId);
    
    res.json({
      message: 'Products retrieved successfully',
      products: userProducts,
      total: userProducts.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while retrieving products' });
  }
});

// Get single product by ID (protected route)
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = products.find(p => p.id === productId && p.userId === req.user.userId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product retrieved successfully',
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error while retrieving product' });
  }
});

// Create new product (protected route)
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    console.log('Received data:', { title, description, category, file: req.file });
    
    // Validate input
    const validation = validateProduct(title, description);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.errors
      });
    }

    // Handle image upload
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
      console.log('Image uploaded to:', imagePath);
    }

    // Create new product
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Electronics',
      image: imagePath,
      userId: req.user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// Update product (protected route)
router.put('/:id', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { title, description, category } = req.body;
    
    console.log('Updating product with data:', { title, description, category, file: req.file });
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Validate input
    const validation = validateProduct(title, description);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validation.errors
      });
    }

    // Find product
    const productIndex = products.findIndex(p => p.id === productId && p.userId === req.user.userId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image upload
    let imagePath = products[productIndex].image; // Keep existing image by default
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
      console.log('New image uploaded to:', imagePath);
    }

    // Update product
    products[productIndex] = {
      ...products[productIndex],
      title: title.trim(),
      description: description.trim(),
      category: category || products[productIndex].category || 'Electronics',
      image: imagePath,
      updatedAt: new Date().toISOString()
    };

    res.json({
      message: 'Product updated successfully',
      product: products[productIndex]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// Delete product (protected route)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Find product
    const productIndex = products.findIndex(p => p.id === productId && p.userId === req.user.userId);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove product
    const deletedProduct = products.splice(productIndex, 1)[0];

    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

export default router;
