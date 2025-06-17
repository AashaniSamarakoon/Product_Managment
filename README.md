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
   git clone https://github.com/AashaniSamarakoon/Product_Managment.git
   cd Product_Managment
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

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on http://localhost:5001

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:3000

## Demo Credentials

For testing purposes, you can use:
- **Email**: admin@example.com
- **Password**: password

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get user's products (protected)
- `POST /api/products` - Create new product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   └── assets/            # Static assets
├── backend/               # Backend Node.js application
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── uploads/          # File uploads
├── public/               # Public static files
└── package.json          # Frontend dependencies
```

## Key Features Implemented

### Authentication System
- JWT-based authentication
- Protected routes
- User registration and login
- Password hashing with bcryptjs

### Product Management
- Create, read, update, delete products
- Image upload functionality
- Category-based filtering
- Real-time UI updates

### Modern UI/UX
- Responsive design with Tailwind CSS
- Interactive forms with validation
- Loading states and error handling
- Modern gradient designs and animations

### Security Features
- CORS configuration
- Rate limiting
- Helmet security headers
- Input validation

## Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Backend
- `npm start` - Start backend server
- `npm run dev` - Start with nodemon for development

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.
