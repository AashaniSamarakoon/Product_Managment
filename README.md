# Full-Stack Product Management Application

A modern web application built with React frontend and Node.js backend for user authentication and product CRUD operations.

## Features

- **User Authentication**: Secure login/register with JWT tokens
- **Product Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Modern UI**: Responsive design with Tailwind CSS
- **Input Validation**: Client and server-side validation with user feedback
- **Protected Routes**: Authentication required for CRUD operations
- **Real-time Updates**: Instant feedback for all operations

## Tech Stack

### Frontend
- React 18 with Vite for fast development
- Tailwind CSS for modern styling
- Axios for HTTP requests
- React Context API for state management

### Backend
- Node.js with Express.js
- JWT authentication
- bcryptjs for password hashing
- In-memory data storage (easily replaceable with database)

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd your-project-directory
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Demo Credentials

For testing, use these credentials:
- **Email**: admin@example.com
- **Password**: password

Or register a new account using the registration form.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get user's products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── ProductList.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── App.jsx            # Main app component
│   └── index.css          # Tailwind CSS imports
├── backend/               # Node.js backend
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   └── products.js   # Product CRUD routes
│   ├── middleware/       # Custom middleware
│   │   └── auth.js       # JWT authentication middleware
│   ├── server.js         # Express server setup
│   └── .env              # Environment variables
└── README.md
```

## Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
```

## Features Details

### Authentication
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Protected routes that require authentication
- Automatic token verification on app load
- Proper error handling and user feedback

### Product Management
- Create products with title and description
- View all products in a responsive grid layout
- Edit existing products with pre-filled forms
- Delete products with confirmation dialog
- Form validation on both client and server side
- Real-time success/error notifications

### User Interface
- Modern, responsive design with Tailwind CSS
- Loading states for better user experience
- Form validation with error messages
- Success/error notifications
- Clean and intuitive user interface

## Security Features

- JWT tokens for secure authentication
- Password hashing with salt
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Protected API routes

## Customization

The application is designed to be easily extensible:

1. **Database Integration**: Replace in-memory storage with your preferred database
2. **Additional Fields**: Add more product fields as needed
3. **File Uploads**: Extend to support image uploads for products
4. **User Roles**: Implement role-based access control
5. **Search & Filter**: Add search and filtering capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
