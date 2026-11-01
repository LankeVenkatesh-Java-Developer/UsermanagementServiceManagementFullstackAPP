# User Management Frontend

React frontend application for the User Management Service with Spring Security backend.

## Features

- **Authentication**: Login and Register with JWT token management
- **Products**: View products (all users), Create/Edit/Delete products (Admin only)
- **Orders**: Create orders and view personal order history
- **Admin Dashboard**: Manage users and view all orders (Admin only)
- **Role-Based Access Control**: USER and ADMIN roles with different permissions

## Tech Stack

- React 18
- Vite
- React Router DOM
- Axios
- TailwindCSS
- Lucide React (icons)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8080`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

The frontend is configured to proxy API requests to the backend:
- Backend URL: `http://localhost:8080`
- API prefix: `/api`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components (Navbar, ProtectedRoute)
│   ├── context/          # React Context (AuthContext)
│   ├── pages/            # Page components (Login, Register, Products, Orders, AdminDashboard)
│   ├── services/         # API service layer (auth, product, order, admin)
│   ├── utils/            # Utility functions (api configuration)
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get current user's orders
- `GET /api/orders/{id}` - Get order by ID

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `DELETE /api/admin/users/{id}` - Delete user (Admin only)
- `GET /api/admin/orders` - Get all orders (Admin only)

## Authentication Flow

1. User registers via `/register` page
2. User logs in via `/login` page
3. JWT token is stored in localStorage
4. Token is automatically included in API request headers
5. Protected routes check for valid token
6. On 401 response, user is redirected to login

## Role-Based Access

- **USER**: Can view products, create orders, view own orders
- **ADMIN**: All USER permissions plus create/edit/delete products, manage users, view all orders

## Development Notes

- The Vite proxy handles CORS by forwarding `/api` requests to the backend
- JWT tokens are stored in localStorage for simplicity
- Axios interceptors handle token injection and 401 errors automatically
- TailwindCSS provides responsive styling out of the box
