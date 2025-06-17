<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Full-Stack Product Management Application

This is a modern full-stack web application built with React frontend and Node.js backend for user authentication and product CRUD operations.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Axios, React Context API
- **Backend**: Node.js, Express.js, JWT authentication, bcryptjs for password hashing
- **Development**: Hot reload, modern ES6+ features, modular architecture

## Project Structure
- `/src` - React frontend application
- `/backend` - Node.js Express server
- `/src/components` - React components (LoginForm, RegisterForm, ProductList)
- `/src/contexts` - React context providers (AuthContext)
- `/backend/routes` - API routes (auth, products)
- `/backend/middleware` - Custom middleware (authentication)

## Key Features
- User authentication (login/register) with JWT tokens
- Protected routes requiring authentication
- Full CRUD operations for products (Create, Read, Update, Delete)
- Input validation and user feedback
- Modern responsive UI with Tailwind CSS
- Error handling and loading states

## Development Guidelines
- Use functional components with React hooks
- Implement proper error handling with user-friendly messages
- Follow RESTful API conventions
- Use Tailwind CSS classes for styling
- Implement proper form validation on both client and server
- Use async/await for API calls
- Follow modern JavaScript ES6+ patterns

## API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `GET /api/products` - Get user's products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Demo Credentials
- Email: admin@example.com
- Password: password
