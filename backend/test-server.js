import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// In-memory user storage
let users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
    name: 'Admin User'
  }
];

// In-memory products storage
let products = [
  {
    id: 1,
    title: 'Sample Product',
    description: 'This is a sample product to demonstrate the application functionality.',
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        errors: {
          email: !email ? 'Email is required' : '',
          password: !password ? 'Password is required' : ''
        }
      });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        errors: { email: 'No account found with this email' }
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        errors: { password: 'Incorrect password' }
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'All fields are required',
        errors: {
          email: !email ? 'Email is required' : '',
          password: !password ? 'Password is required' : '',
          name: !name ? 'Name is required' : ''
        }
      });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists',
        errors: { email: 'An account with this email already exists' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name
    };

    users.push(newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

// Product routes
app.get('/api/products', authenticateToken, (req, res) => {
  try {
    const userProducts = products.filter(product => product.userId === req.user.userId);
    res.json({
      message: 'Products retrieved successfully',
      products: userProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

app.post('/api/products', authenticateToken, (req, res) => {
  try {
    const { title, description } = req.body;
    
    const errors = {};
    if (!title || !title.trim()) {
      errors.title = 'Title is required';
    }
    if (!description || !description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Validation errors',
        errors
      });
    }
    
    const newProduct = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      title: title.trim(),
      description: description.trim(),
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
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { title, description } = req.body;
    
    const productIndex = products.findIndex(p => p.id === productId && p.userId === req.user.userId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const errors = {};
    if (!title || !title.trim()) {
      errors.title = 'Title is required';
    }
    if (!description || !description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Validation errors',
        errors
      });
    }
    
    products[productIndex] = {
      ...products[productIndex],
      title: title.trim(),
      description: description.trim(),
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      message: 'Product updated successfully',
      product: products[productIndex]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const productIndex = products.findIndex(p => p.id === productId && p.userId === req.user.userId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
