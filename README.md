# Tribal Products E-Commerce Platform

A full-stack MERN application for selling tribal products with comprehensive admin panel and user management system.

## Project Overview

This is a production-ready e-commerce platform built with the MERN stack, designed for selling tribal products. The project features complete user authentication, comprehensive product management, user profile system, payment processing, and a powerful admin panel for complete platform manageme# Feature Testing  
npm run test:auth     # Test complete authentication flow
npm run test:email    # Test email service with Gmail
npm run test:db       # Test database connection
npm run test:products # Test product management features (same as module4)

# File Upload Testing
npm run test:module5  # Test file upload system (12/12 tests)

# Shopping Cart & Order Testing
npm run test:module6  # Test cart and order management (10/10 tests)
npm run test:cart-api # Test cart and order API endpoints

# Advanced Search Testing
npm run test:module8  # Test advanced search and filter API (13/13 tests)

# User Profile Testing
node test/test-user-profile.js  # Test complete user profile system (10/10 tests)

**Current Development Status**: Backend modules 1-8 completed with advanced search system ✅, Frontend Modules 9-12 completed with complete checkout and order management system ✅

## Tech Stack

### Backend (Completed Modules)
- Node.js with Express.js
- MongoDB Atlas for database with Mongoose ODM
- JWT for secure authentication
- bcryptjs for password hashing
- Nodemailer for email verification
- CORS for cross-origin requests
- Comprehensive testing suite (22+ tests)

### Planned Frontend
- React 18 with Vite ✅
- Redux Toolkit for state management ✅
- Axios for API calls ✅
- Tailwind CSS for styling ✅
- React Router DOM for navigation ✅

### Additional Tools
- dotenv for environment variables
- Axios for API testing
- Gmail SMTP for email services

## Features Implemented

### User Authentication & Management ✅
- User registration with email verification
- Login/logout with JWT authentication
- Password reset functionality with email verification
- Comprehensive user profile management system
- Multiple address management with default address handling
- User preferences management (theme, notifications, newsletter)
- Secure password hashing and token management

### Admin Features ✅
- Secure admin panel access with role-based authentication
- Complete product management (Create, Read, Update, Delete)
- Product description editing with validation
- Product category management (8 categories)
- Stock management and inventory tracking
- Admin-only authorization middleware protection
- Complete order management system with status updates
- Order statistics and analytics dashboard
- Admin order filtering and search capabilities

### Product Management System ✅
- Complete product CRUD operations
- Advanced search functionality across names, descriptions, and tags
- Category-based filtering with pagination support
- Stock management with automatic tracking
- SEO-friendly URL slug generation
- Input validation and comprehensive error handling

### User Profile System ✅
- Complete user profile management with personal information
- Multiple address management (add, edit, delete, set default)
- User preferences customization
- Secure JWT authentication on all profile operations
- Address validation and error handling
- Profile data validation and sanitization

### File Upload System ✅
- User avatar selection from pre-defined options
- Admin product image upload and management
- File validation and security measures
- Static file serving for production
- Image replacement and update functionality

### Shopping Cart & Order Management ✅
- Persistent shopping cart with real-time calculations
- Add, update, remove items with stock validation
- Complete order lifecycle management
- Order status tracking with history
- Admin order management panel with full CRUD operations
- Order statistics and analytics dashboard
- Payment method selection and order processing

### Technical Features
- RESTful API architecture
- JWT-based authentication system
- File upload handling for product images
- Secure payment gateway integration
- User profile management system
- Responsive design for all devices
- Environment-based configuration
- Email verification system
- Password reset functionality

## Project Structure

```
Trybee/
├── backend/
│   ├── config/              # Database and payment configuration
│   ├── controllers/         # Business logic (auth, products, payments, users)
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models (User, Product, Order, Payment)
│   ├── routes/              # API route definitions
│   ├── utils/               # Utility functions (JWT, email, payment)
│   ├── uploads/             # File upload directory
│   ├── docs/                # Project documentation
│   ├── test/                # Complete test suite (10+ test files)
│   ├── .env                 # Environment variables
│   ├── server.js            # Main server file
│   └── package.json         # Dependencies and scripts
├── frontend/ (🚧 To be implemented - Modules 9-14)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Development Modules

### Backend Development Progress: 8/8 Modules Completed ✅

**Completed Systems**:
- ✅ **Module 1**: Server Setup & Basic Configuration (1-2 days)
- ✅ **Module 2**: Database Connection & User Model (2-3 days)  
- ✅ **Module 3**: Authentication System with Email Verification (3-4 days)
- ✅ **Module 4**: Product Management & Admin CRUD Operations (2-3 days)
- ✅ **User Profile System**: Complete Profile & Address Management (2-3 days)
- ✅ **Module 5**: File Upload System - Avatar & Product Image Management (2-3 days)
- ✅ **Module 6**: Shopping Cart & Order Management with Admin Panel (2-3 days)
- ✅ **Module 8**: Advanced Search & Filter API with Analytics (2-3 days)

**Skipped Module**:
- ⏭️ **Module 7**: Payment Gateway Integration (3-4 days) - Skipped for now

### Frontend Development Progress: 4/6 Modules Completed ✅

**Completed Systems**:
- ✅ **Module 9**: Frontend Foundation - React + Vite + Redux + Tailwind (3 days)
- ✅ **Module 10**: Authentication UI & User Profile - Complete Auth System (3 days)
- ✅ **Module 11**: Product Catalog & Search UI - Complete Product Display System (4 days)
- ✅ **Module 12**: Shopping Cart & Checkout UI - Complete Cart & Order Management System (2 days)

**Remaining Modules**:
- 📋 **Module 13**: User Dashboard & Orders (3-4 days) - NEXT PRIORITY
- 📋 **Module 14**: Admin Panel (5-7 days)
- 📋 **Module 15**: Performance & Deployment (2-3 days)

### Backend Modules (1-8) - Detailed Breakdown

#### **Module 1: Project Setup & Basic Server**
**Duration**: 1-2 days
**Objective**: Set up the foundation for the backend application
**What you'll learn**: Express.js basics, middleware, server setup

**Tasks**:
- Initialize Node.js project with npm ✅
- Install Express.js and basic dependencies (cors, dotenv) ✅
- Create basic server structure with folders (config, controllers, middleware, models, routes, utils) ✅
- Set up basic Express server with CORS and JSON parsing middleware ✅
- Create a health check endpoint to test server ✅
- Configure environment variables with .env file ✅
- Add nodemon for development server auto-restart ✅

**Key Files Created**:
- `server.js` - Main server file ✅
- `package.json` - Dependencies and scripts ✅
- `.env` - Environment variables ✅
- Basic folder structure ✅

**Testing**: Server runs on specified port and returns health check response
**Status**: ✅ COMPLETED - Module 1 fully implemented and tested

#### **Module 2: Database Setup & User Model**
**Duration**: 2-3 days
**Objective**: Connect to MongoDB and create User schema
**What you'll learn**: MongoDB Atlas, Mongoose ODM, database modeling

**Tasks**:
- Set up MongoDB Atlas account and cluster ✅
- Install Mongoose for MongoDB object modeling ✅
- Create database connection configuration ✅
- Design and implement User model with validation ✅
- Test database connection and basic CRUD operations ✅
- Add error handling for database operations ✅
- Create database utilities for connection management ✅

**Key Files Created**:
- `config/database.js` - Database connection ✅
- `models/User.js` - User schema and model ✅
- `utils/dbUtils.js` - Database utilities ✅

**Testing**: Successful connection to MongoDB Atlas and user creation/retrieval
**Status**: ✅ COMPLETED - All tests passing, authentication features ready

#### **Module 3: Authentication System**
**Duration**: 3-4 days
**Objective**: Implement complete user authentication with email verification
**What you'll learn**: JWT tokens, password hashing, email services, authentication middleware
**Status**: ✅ COMPLETED - Full authentication system implemented and tested

**Tasks**:
- Install authentication dependencies (bcryptjs, jsonwebtoken, nodemailer) ✅
- Implement password hashing and comparison ✅
- Create JWT token generation and verification utilities ✅
- Build registration endpoint with email verification ✅
- Build login endpoint with JWT token response ✅
- Implement email verification system with Nodemailer ✅
- Create password reset functionality ✅
- Build authentication middleware for protected routes ✅
- Add input validation and error handling ✅

**Key Files Created**:
- `controllers/authController.js` - Authentication logic ✅
- `routes/authRoutes.js` - Authentication endpoints ✅
- `middleware/authMiddleware.js` - Token verification ✅
- `utils/emailService.js` - Email sending utilities ✅
- `utils/tokenUtils.js` - JWT utilities ✅

**Testing**: User registration, login, email verification, and password reset ✅

#### **Module 4: Product Model & CRUD Operations**
**Duration**: 2-3 days
**Objective**: Create product management system with admin controls
**What you'll learn**: Database relationships, admin authorization, CRUD operations
**Status**: ✅ COMPLETED - Full product management system implemented and tested

**Tasks**:
- Design and implement Product model with validation ✅
- Create admin-only middleware for product management ✅
- Build CRUD endpoints for products (Create, Read, Update, Delete) ✅
- Implement product categories and stock management ✅
- Add input validation for product data ✅
- Create error handling for product operations ✅
- Add pagination for product listings ✅

**Key Files Created**:
- `models/Product.js` - Product schema and model ✅
- `controllers/productController.js` - Product management logic ✅
- `routes/productRoutes.js` - Product endpoints ✅
- `middleware/adminMiddleware.js` - Admin authorization ✅

**Testing**: Product creation, retrieval, updates (including description updates), and deletion with proper authorization ✅

**Admin Capabilities**: 
- ✅ Admin can update ALL product fields including name, description, price, category, stock, images
- ✅ Complete product description editing functionality implemented
- ✅ Validation ensures data integrity during updates
- ✅ Authorization prevents non-admin users from making changes

#### **User Profile Management System**
**Duration**: 2-3 days
**Objective**: Implement comprehensive user profile system with personal information and address management
**What you'll learn**: User data management, profile updates, address handling, secure information management
**Status**: ✅ COMPLETED - Full user profile system implemented and tested

**Tasks**:
- Extend User model with profile fields (firstName, lastName, phone, gender, preferences) ✅
- Create comprehensive profile management endpoints ✅
- Implement address management system (CRUD operations) ✅
- Add default address handling with automatic assignment ✅
- Create profile update validation and error handling ✅
- Add secure authentication protection for all profile routes ✅
- Implement comprehensive testing suite for all functionality ✅

**Key Files Created**:
- Extended `models/User.js` - Additional profile fields and address schema ✅
- `controllers/userController.js` - Complete user profile management (6 functions) ✅
- `routes/userRoutes.js` - Profile and address endpoints with authentication ✅
- `test/test-user-profile.js` - Comprehensive testing suite ✅
- `docs/USER_PROFILE_SYSTEM.md` - Complete system documentation ✅

**Testing Results**: 10/10 tests passing - Complete functionality validation ✅

**Profile Features Implemented**:
- ✅ User profile creation and updates with validation
- ✅ Multiple address management with default address selection
- ✅ User preferences management (theme, notifications, newsletter)
- ✅ Secure JWT authentication on all profile endpoints
- ✅ Address CRUD operations with proper error handling
- ✅ Profile data validation and sanitization
- ✅ Complete test coverage with real API testing

#### **Module 5: File Upload System (Image Management)**
**Duration**: 2-3 days
**Objective**: Handle avatar uploads for users and product image management for admins
**What you'll learn**: File handling, Multer middleware, file validation, static file serving
**Status**: ✅ COMPLETED - Full file upload system implemented and tested

**Tasks**:
- Install and configure Multer for file uploads ✅
- Set up file storage configuration with organized directory structure ✅
- Implement file validation (size, type restrictions, security) ✅
- Create avatar selection system with 5 pre-defined options ✅
- Add product image upload endpoints (admin only) ✅
- Implement image replacement and update functionality ✅
- Add file deletion for product updates ✅
- Create file serving middleware for production ✅
- Add comprehensive error handling for file operations ✅

**Key Files Created**:
- `middleware/uploadMiddleware.js` - Multer configuration with validation ✅
- `controllers/uploadController.js` - File upload business logic (6 controllers) ✅
- `routes/uploadRoutes.js` - Upload endpoints with authentication ✅
- `routes/fileRoutes.js` - Static file serving for production ✅
- `assets/avatars/` - 5 default avatar files ✅
- `uploads/` - File storage directories ✅
- `test/test-module5.js` - Comprehensive test suite ✅

**Features Implemented**:
- ✅ User avatar selection from 5 pre-defined options
- ✅ Admin-only product image upload (maximum 5 images per product)
- ✅ Product image updates and replacement functionality
- ✅ File serving for both avatars and product images
- ✅ Proper authorization and validation throughout
- ✅ Production-ready file handling with organized structure
- ✅ Comprehensive file validation (JPEG, PNG, WebP, 5MB limit)
- ✅ Secure file operations with proper error handling

**Testing Results**: 12/12 tests passing ✅
**Production Ready**: Yes - includes proper file serving for deployment

#### **Module 6: Shopping Cart & Order Management**
**Duration**: 2-3 days
**Objective**: Implement shopping cart functionality and order processing
**What you'll learn**: Session management, cart operations, order lifecycle
**Status**: ✅ COMPLETED - Full shopping cart and order management system implemented and tested

**Tasks**:
- Create Cart model for user shopping carts ✅
- Implement cart CRUD operations (add, update, remove items) ✅
- Add cart persistence and session management ✅
- Create order processing workflow ✅
- Implement order status tracking ✅
- Add inventory management during checkout ✅
- Create order history for users ✅
- Build admin panel for order management ✅

**Key Files Created**:
- `models/Cart.js` - Shopping cart model with pre-save calculations ✅
- `models/Order.js` - Order management model with status history ✅
- `controllers/cartController.js` - Cart operations (6 functions) ✅
- `controllers/orderController.js` - Order processing (8 functions) ✅
- `routes/cartRoutes.js` - Cart endpoints ✅
- `routes/orderRoutes.js` - Order endpoints with admin routes ✅
- `test/test-module6.js` - Comprehensive test suite ✅
- `test/test-cart-order-api.js` - API endpoint testing ✅
- `docs/module6-shopping-cart-orders.md` - System documentation ✅

**Features Implemented**:
- ✅ Persistent shopping cart with real-time calculations
- ✅ Cart CRUD operations with stock validation
- ✅ Complete order lifecycle management (pending → delivered)
- ✅ Order status tracking with history and admin notes
- ✅ Admin order management panel with full CRUD operations
- ✅ Order statistics and analytics dashboard
- ✅ Payment method selection ready for Module 7
- ✅ Order cancellation functionality for users

**Testing Results**: 10/10 tests passing ✅
**Production Ready**: Yes - Complete cart and order system operational

#### **Module 7: Payment Gateway Integration**
**Duration**: 3-4 days
**Objective**: Implement secure payment processing with multiple payment options
**What you'll learn**: Payment gateway integration, secure transactions, order management
**Status**: 🚧 UPCOMING - Payment system implementation

**Tasks**:
- Integrate Razorpay/Stripe for card payments
- Implement UPI payment gateway
- Add Cash on Delivery option
- Integrate payment processing with existing Order model
- Build payment verification system
- Add payment status tracking and updates
- Implement refund functionality
- Create payment security measures

**Key Files Created**:
- `models/Payment.js` - Payment details and transaction model
- `controllers/paymentController.js` - Payment processing logic
- `routes/paymentRoutes.js` - Payment endpoints
- `utils/paymentUtils.js` - Payment helper functions
- `config/payment.js` - Payment gateway configuration

**Testing**: Payment processing, order creation, transaction verification

#### **Module 8: Advanced Search & Filter API**
**Duration**: 2-3 days
**Objective**: Enhance existing search with advanced filtering capabilities
**What you'll learn**: Advanced database queries, search optimization, complex filtering
**Status**: ✅ COMPLETED - Advanced search features implemented and tested

**Tasks**:
- Enhance existing text search functionality ✅ (Enhanced with advanced features)
- Add price range filtering ✅
- Implement advanced sorting options (price, date, name, popularity) ✅
- Add search result counting and analytics ✅
- Create advanced search combinations ✅
- Optimize queries for performance ✅
- Add search suggestions and autocomplete ✅
- Implement search history and saved searches ✅

**Key Files Created**:
- `controllers/advancedSearchController.js` - Advanced search logic (4 functions) ✅
- `routes/advancedSearchRoutes.js` - Advanced search endpoints ✅
- `utils/searchUtils.js` - Search optimization utilities ✅
- `test/test-module8.js` - Comprehensive testing suite ✅
- `docs/MODULE-8-COMPLETE.md` - Complete system documentation ✅

**Features Implemented**:
- ✅ Advanced search with multiple filters (text, category, price, tags, stock)
- ✅ Multiple sorting options (name, price, date, stock) with ascending/descending
- ✅ Pagination with configurable limits and proper metadata
- ✅ Search suggestions and autocomplete functionality
- ✅ Filter options API for frontend integration
- ✅ Combined filters working simultaneously
- ✅ Admin analytics with category stats, price distribution, stock analytics
- ✅ Performance optimized with proper database indexing
- ✅ Input validation and error handling throughout

**Testing Results**: 13/13 tests passing ✅
**Production Ready**: Yes - includes comprehensive search and filter capabilities

**Already Implemented in Module 4**:
- ✅ Text search functionality for product names and descriptions
- ✅ Category-based filtering
- ✅ Pagination for search results

**Testing**: Search functionality with various filters and combinations ✅

### Frontend Modules (9-14)

#### **Module 9: Frontend Setup & Foundation**
**Duration**: 3 days
**Objective**: Set up React application with routing, state management, and responsive homepage
**What you'll learn**: React + Vite, Redux Toolkit, React Router, Tailwind CSS, Component Architecture
**Status**: ✅ COMPLETED - Modern React foundation with interactive features

**Tasks**:
- Create React application with Vite ✅
- Install and configure Tailwind CSS ✅
- Set up React Router DOM for navigation ✅
- Install and configure Redux Toolkit for state management ✅
- Install Axios for API calls ✅
- Create basic layout structure and components ✅
- Set up Redux store with authentication slice ✅
- Create routing structure for all pages ✅
- Configure Axios base URL and interceptors ✅
- Build responsive homepage with carousel ✅
- Implement interactive carousel with smooth transitions ✅
- Create features, categories, and products sections ✅
- Add newsletter subscription section ✅
- Resolve CSS conflicts and ensure responsive design ✅

**Key Files Created**:
- `src/App.jsx` - Main application component ✅
- `src/main.jsx` - Application entry point ✅
- `src/store/index.js` - Redux store configuration ✅
- `src/store/authSlice.js` - Authentication state management ✅
- `src/store/productSlice.js` - Product and category management ✅
- `src/store/cartSlice.js` - Shopping cart state ✅
- `src/store/userSlice.js` - User profile state ✅
- `src/store/orderSlice.js` - Order management state ✅
- `src/utils/axios.js` - Axios configuration ✅
- `src/components/Layout.jsx` - Main layout component ✅
- `src/components/ProtectedRoute.jsx` - Route protection ✅
- `src/pages/HomePage.jsx` - Interactive homepage with carousel ✅
- `src/pages/LoginPage.jsx` - User authentication ✅
- `src/pages/RegisterPage.jsx` - User registration ✅
- `src/pages/ProfilePage.jsx` - User profile management ✅
- `src/pages/CartPage.jsx` - Shopping cart ✅
- `tailwind.config.js` - Tailwind configuration ✅
- `vite.config.js` - Vite configuration ✅

**Features Implemented**:
- ✅ Modern React 18 + Vite setup with fast development server
- ✅ Tailwind CSS integration with responsive design
- ✅ Redux Toolkit with 5 slices for comprehensive state management
- ✅ React Router DOM with lazy loading and protected routes
- ✅ Axios configuration with interceptors and error handling
- ✅ Interactive homepage with 3-slide carousel
- ✅ Carousel features: auto-play, pause on hover, smooth infinite transitions
- ✅ Navigation arrows and slide indicators
- ✅ Responsive layout with mobile-first design
- ✅ API integration with backend (featured products, categories)
- ✅ Component-based architecture for reusability
- ✅ CSS conflict resolution between Tailwind and custom styles

**Testing**: Application runs successfully, carousel works smoothly, API integration functional, responsive on all devices ✅

**Challenges Overcome**:
- ✅ Resolved CSS conflicts between Tailwind utilities and custom CSS
- ✅ Fixed carousel positioning issues for proper content display on all slides
- ✅ Improved navigation arrow visibility with better contrast
- ✅ Implemented smooth infinite loop transitions instead of jump-back effect
- ✅ Connected frontend to backend APIs with proper error handling

#### **Module 10: Authentication UI & User Profile**
**Duration**: 3 days
**Objective**: Create complete authentication interface with enhanced user experience
**What you'll learn**: Form handling, Redux state management, protected routes, profile management
**Status**: ✅ COMPLETED - Complete authentication system with phone number support and enhanced UX

**Tasks**:
- Create registration form with firstName, lastName, phone, email, password ✅
- Create login form with enhanced user experience ✅
- Implement email verification page with dedicated UI ✅
- Create forgot password functionality with email sending ✅
- Build password reset form with secure token handling ✅
- Create comprehensive user profile dashboard with editing ✅
- Add profile editing functionality with real-time validation ✅
- Remove email verification requirement from login ✅
- Set up protected routes with authentication checks ✅
- Add loading states and error messages throughout ✅
- Implement logout functionality ✅
- Create authentication state persistence ✅

**Key Files Created**:
- `src/pages/RegisterPage.jsx` - Enhanced registration with phone field ✅
- `src/pages/LoginPage.jsx` - Login page with forgot password link ✅
- `src/pages/VerifyEmailPage.jsx` - Email verification handling ✅
- `src/pages/ForgotPasswordPage.jsx` - Password reset request ✅
- `src/pages/ResetPasswordPage.jsx` - Password reset form ✅
- `src/pages/ProfilePage.jsx` - Complete profile management ✅
- `src/components/ProtectedRoute.jsx` - Route protection ✅
- `src/store/authSlice.js` - Enhanced with all auth actions ✅

**Features Implemented**:
- ✅ Complete registration form with phone number field and validation
- ✅ Login without email verification requirement (improved UX)
- ✅ Email verification page with success/error states
- ✅ Forgot password and reset password functionality
- ✅ Comprehensive user profile page with editing capabilities
- ✅ Registration data flows directly to user profile
- ✅ Real-time form validation and password strength indicators
- ✅ Responsive design for all authentication pages
- ✅ Enhanced Redux state management for all auth flows
- ✅ Complete error handling and success messaging

**Backend Enhancements**:
- ✅ Registration controller accepts firstName, lastName, phone fields
- ✅ Removed email verification requirement from login for better UX
- ✅ Enhanced login response includes complete user profile data
- ✅ Email verification remains available but optional for account security

**Testing**: Complete authentication flow working - registration with phone, login without verification, email verification, password reset, profile management ✅

#### **Module 11: Product Display & Shopping Cart UI** ✅
**Duration**: 4 days (Completed)
**Objective**: Create product browsing interface and shopping cart functionality
**What you'll learn**: Component design, state management, cart operations, product filtering

**Completed Tasks**:
- ✅ Create product listing page with grid/list view (ProductsPage.jsx)
- ✅ Build product detail page with image gallery (ProductDetailPage.jsx)
- ✅ Implement product search and filtering interface (SearchBar.jsx, FilterSidebar.jsx)
- ✅ Create category navigation and breadcrumbs
- ✅ Build shopping cart component with item management
- ✅ Add cart sidebar/dropdown with real-time updates
- ✅ Implement quantity selectors and remove item functionality
- ✅ Create responsive product cards and layouts (ProductCard.jsx)
- ✅ Add personalized product display with purchase history integration
- ✅ Implement wishlist functionality with user preferences
- ✅ Create comprehensive product reviews system (ProductReviews.jsx)
- ✅ Build image gallery with zoom and fullscreen capabilities (ProductImageGallery.jsx)
- ✅ Add related products recommendations (RelatedProducts.jsx)
- ✅ Implement loading skeletons and error handling (LoadingSkeleton.jsx)
- ✅ Create pagination component for product browsing (Pagination.jsx)

**Key Components Created**:
- ProductsPage.jsx - Main product listing with personalization
- ProductCard.jsx - Product display with purchase history
- SearchBar.jsx - Advanced search with autocomplete
- FilterSidebar.jsx - Comprehensive filtering system
- ProductGrid.jsx - Organized product display
- ProductDetailPage.jsx - Detailed product view
- ProductImageGallery.jsx - Image display with interactions
- RelatedProducts.jsx - Product recommendations
- ProductReviews.jsx - Review system
- Pagination.jsx - Navigation component
- LoadingSkeleton.jsx - Loading states

**Testing**: All components integrated with Redux state management and backend APIs ✅
- Add product rating and review components
- Implement wishlist functionality

**Key Files Created**:
- `src/pages/Products.jsx` - Product listing page
- `src/pages/ProductDetail.jsx` - Single product view
- `src/pages/Category.jsx` - Category-specific products
- `src/components/ProductCard.jsx` - Product display component
- `src/components/Cart/Cart.jsx` - Shopping cart component
- `src/components/Cart/CartItem.jsx` - Individual cart item
- `src/components/Cart/CartSidebar.jsx` - Cart sidebar
- `src/components/ProductGallery.jsx` - Image gallery component
- `src/components/SearchBar.jsx` - Product search component
- `src/store/cartSlice.js` - Cart state management
- `src/store/productSlice.js` - Product state management

**Testing**: Product browsing, cart operations, responsive design, search functionality

**Status**: ✅ COMPLETED - Complete checkout and order management system implemented

**Completed Tasks**:
- ✅ Created comprehensive CheckoutPage with full shipping form and validation
- ✅ Implemented shipping information form with Indian address fields
- ✅ Added payment method selection (COD active, UPI/Card coming soon)
- ✅ Built order summary with cart items, price breakdown, and tax calculation
- ✅ Added form validation for all required fields (phone, email, address, etc.)
- ✅ Enhanced orderSlice with async thunks for backend integration
- ✅ Created OrdersPage for viewing order history with filtering
- ✅ Built OrderDetailPage for individual order details
- ✅ Made "Buy Now" button functional in ProductDetailPage
- ✅ Integrated checkout flow from cart and product detail pages
- ✅ Added order status tracking and cancellation functionality
- ✅ Implemented complete order management ready for admin panel

**Key Components Created**:
- CheckoutPage.jsx - Complete checkout flow with forms and validation
- OrdersPage.jsx - Order history with status filtering and pagination
- OrderDetailPage.jsx - Detailed order view with shipping and payment info
- Enhanced orderSlice.js - Full Redux integration with backend APIs
- Updated ProductDetailPage.jsx - Functional Buy Now button

**Backend Integration**:
- ✅ POST /api/orders/create - Create order with shipping and payment details
- ✅ GET /api/orders/user - Fetch user order history with pagination
- ✅ GET /api/orders/:id - Get detailed order information
- ✅ PUT /api/orders/:id/cancel - Cancel order functionality
- ✅ Cart clearing after successful order placement

**Features Implemented**:
- ✅ Comprehensive checkout form with validation (10+ fields)
- ✅ Indian address format with phone number validation
- ✅ Real-time form validation and error handling
- ✅ Order summary with tax calculation and shipping rules
- ✅ Multiple payment methods (COD active, others coming soon)
- ✅ Order history page with status filtering and pagination
- ✅ Order detail page with complete order information
- ✅ Order status tracking (pending → confirmed → processing → shipped → delivered)
- ✅ Order cancellation for eligible orders (pending/confirmed)
- ✅ Buy Now functionality for direct checkout from product pages
- ✅ Responsive design optimized for mobile and desktop
- ✅ Cart integration with automatic clearing after order placement
- ✅ Toast notifications for success and error handling
- ✅ Order confirmation with email notification ready

**Admin Panel Integration Ready**:
- ✅ Order management endpoints ready for admin interface
- ✅ Order status update functionality prepared
- ✅ Order filtering and search capabilities built
- ✅ Order statistics and analytics backend ready

**Testing**: Complete checkout workflow tested - form validation, order creation, order history, order details, buy now functionality ✅
**Production Ready**: Yes - includes comprehensive error handling, validation, and responsive design ✅

#### **Module 13: Admin Panel UI**
**Duration**: 4-5 days
**Objective**: Build comprehensive admin dashboard and management interface
**What you'll learn**: Admin interfaces, data tables, charts, file uploads, complex forms

**Tasks**:
- Create admin dashboard with statistics and analytics
- Build product management interface (CRUD operations)
- Implement order management system with status updates
- Create user management interface
- Add file upload components for product images
- Build data tables with sorting, filtering, and pagination
- Implement admin authentication and role-based access
- Create analytics charts and reports
- Add bulk operations and export functionality
- Build admin notification system

**Key Files Created**:
- `src/pages/admin/Dashboard.jsx` - Admin dashboard
- `src/pages/admin/Products.jsx` - Product management
- `src/pages/admin/ProductForm.jsx` - Add/edit product form
- `src/pages/admin/Orders.jsx` - Order management
- `src/pages/admin/Users.jsx` - User management
- `src/components/admin/Sidebar.jsx` - Admin sidebar navigation
- `src/components/admin/StatsCard.jsx` - Statistics display
- `src/components/admin/DataTable.jsx` - Reusable data table
- `src/components/admin/ImageUpload.jsx` - Image upload component
- `src/components/admin/OrderManagement.jsx` - Order status updates
- `src/store/adminSlice.js` - Admin state management

**Testing**: Admin operations, data management, file uploads, analytics display

#### **Module 14: Production Deployment & Optimization**
**Duration**: 2-3 days
**Objective**: Prepare application for production deployment
**What you'll learn**: Build optimization, deployment strategies, performance optimization, monitoring

**Tasks**:
- Optimize frontend build for production (code splitting, lazy loading)
- Implement performance optimizations (image lazy loading, caching)
- Set up environment configuration for different stages
- Configure deployment for Vercel/Netlify (frontend) and Railway/Heroku (backend)
- Implement error boundaries and error tracking
- Add loading skeletons and improved UX
- Set up monitoring and analytics
- Implement SEO optimizations (meta tags, sitemap)
- Add progressive web app (PWA) features
- Create deployment documentation and CI/CD pipeline

**Key Files Created**:
- `vite.config.js` - Optimized build configuration
- `src/components/ErrorBoundary.jsx` - Error handling
- `src/components/LoadingSkeleton.jsx` - Loading states
- `src/utils/seo.js` - SEO utilities
- `public/manifest.json` - PWA manifest
- `src/sw.js` - Service worker for PWA
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `vercel.json` - Vercel deployment config
- `netlify.toml` - Netlify deployment config

**Testing**: Production builds, deployment process, performance metrics, cross-browser compatibility

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Razorpay/Stripe account for payments
- Git

### Backend Setup
```bash
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer nodemailer razorpay
npm install -D nodemon axios
```

### Frontend Setup ✅ COMPLETED
```bash
cd frontend
npm create vite@latest . -- --template react     ✅
npm install                                       ✅
npm install react-router-dom axios @reduxjs/toolkit react-redux  ✅
npm install -D tailwindcss postcss autoprefixer  ✅
npx tailwindcss init -p                          ✅
```

## Available NPM Scripts

### Development Scripts
```bash
cd backend
npm start              # Run server in production mode
npm run dev           # Run server with nodemon (auto-restart)
```

### Testing Scripts
```bash
# Module Testing
npm run test:module1  # Test server setup and health endpoints
npm run test:module2  # Test database connection and User model
npm run test:module3  # Test authentication system components
npm run test:module4  # Test product CRUD operations and admin features

# Feature Testing  
npm run test:auth     # Test complete authentication flow
npm run test:email    # Test email service with Gmail
npm run test:db       # Test database connection
npm run test:module4 # Test product management features

# User Profile Testing (NEW)
node test/test-user-profile.js  # Test complete user profile system (10/10 tests)

# Utility Scripts
npm run test:cleanup  # Clean up test data from database
```

### Testing Features
- ✅ **Server Health Testing** - Health endpoints and middleware
- ✅ **Database Testing** - MongoDB connection and CRUD operations
- ✅ **Authentication Testing** - Complete JWT auth flow with email
- ✅ **Product Management Testing** - Full CRUD operations with admin auth
- ✅ **User Profile Testing** - Complete profile and address management (10/10 tests)
- ✅ **File Upload Testing** - Avatar selection and product image management (12/12 tests)
- ✅ **Shopping Cart Testing** - Cart operations and order management (10/10 tests)
- ✅ **Email Testing** - Real Gmail SMTP integration testing
- ✅ **Admin Authorization Testing** - Secure admin-only operations
- ✅ **Clean Test Environment** - Automated test data cleanup

### Test Results Summary
- **Module 1**: Server & Health Endpoints ✅
- **Module 2**: Database & User Model (11/11 tests) ✅
- **Module 3**: Authentication System (8/8 tests) ✅
- **Module 4**: Product CRUD Operations (12/12 tests) ✅
- **User Profile System**: Profile & Address Management (10/10 tests) ✅
- **Module 5**: File Upload System (12/12 tests) ✅
- **Module 6**: Shopping Cart & Order Management (10/10 tests) ✅

**Total: 63+ tests passing across all modules**

## Environment Variables

Create a `.env` file in the backend directory:
```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_for_authentication
JWT_EXPIRE=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

# Client Configuration
CLIENT_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com

# Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe Configuration (Alternative)
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Setting up Gmail for Email Service:
1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use your Gmail address for `EMAIL_USER`
4. Use the generated 16-character app password for `EMAIL_PASS`

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/verify-email` - Email verification
- POST `/api/auth/forgot-password` - Password reset request
- POST `/api/auth/reset-password` - Password reset

### Products
- GET `/api/products` - Get all products with filters
- GET `/api/products/search` - Search products
- GET `/api/products/category/:category` - Get products by category
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin only)
- PUT `/api/products/:id` - Update product (Admin only) - **Supports description updates**
- DELETE `/api/products/:id` - Delete product (Admin only)

### User Profile ✅ IMPLEMENTED
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile  
- GET `/api/users/addresses` - Get user addresses
- POST `/api/users/addresses` - Add new address
- PUT `/api/users/addresses/:id` - Update address
- DELETE `/api/users/addresses/:id` - Delete address

### Shopping Cart ✅ IMPLEMENTED
- GET `/api/cart` - Get user's cart
- POST `/api/cart/add` - Add item to cart
- PUT `/api/cart/update` - Update cart item quantity
- DELETE `/api/cart/remove/:productId` - Remove item from cart
- DELETE `/api/cart/clear` - Clear entire cart
- GET `/api/cart/summary` - Get cart summary

### Order Management ✅ IMPLEMENTED
**User Routes:**
- POST `/api/orders/create` - Create new order from cart
- GET `/api/orders` - Get user's orders
- GET `/api/orders/:orderId` - Get specific order details
- PUT `/api/orders/:orderId/cancel` - Cancel order

**Admin Routes:**
- GET `/api/orders/admin/all` - Get all orders
- PUT `/api/orders/admin/:orderId/status` - Update order status
- DELETE `/api/orders/admin/:orderId` - Delete order
- GET `/api/orders/admin/stats` - Get order statistics

### File Upload ✅ IMPLEMENTED
- POST `/api/upload/avatar` - Select user avatar
- POST `/api/upload/product-images` - Upload product images (Admin only)
- PUT `/api/upload/product-images/:productId` - Update product images (Admin only)
- GET `/files/avatars/:filename` - Serve avatar files
- GET `/files/products/:filename` - Serve product images

### Planned Payment Endpoints (Module 7)
- POST `/api/payments/create-order` - Create payment order
- POST `/api/payments/verify` - Verify payment
- POST `/api/payments/cod` - Place Cash on Delivery order
- GET `/api/payments/history` - Get payment history
- PUT `/api/payments/refund/:orderId` - Process refund (Admin)

## Database Schema

### User Model ✅ ENHANCED WITH PROFILE SYSTEM
```javascript
{
  // Authentication Fields
  email: String (required, unique)
  password: String (required, hashed)
  isVerified: Boolean (default: false)
  isAdmin: Boolean (default: false)
  verificationToken: String
  resetPasswordToken: String
  resetPasswordExpire: Date
  
  // Profile Information (NEW)
  firstName: String (optional)
  lastName: String (optional)
  phone: String (optional)
  gender: Enum ['male', 'female', 'other'] (optional)
  dateOfBirth: Date (optional)
  
  // Address Management (NEW)
  addresses: [{
    title: String (required) // e.g., 'Home', 'Office'
    street: String (required)
    city: String (required)
    state: String (required)
    zipCode: String (required, validated)
    country: String (default: 'India')
    phone: String (optional)
    isDefault: Boolean (default: false)
  }]
  
  // User Preferences (NEW)
  preferences: {
    newsletter: Boolean (default: true)
    notifications: Boolean (default: true)
    theme: Enum ['light', 'dark', 'auto'] (default: 'light')
  }
  
  // Timestamps
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}
}
```

### Product Model ✅ IMPLEMENTED
```javascript
{
  name: String (required)
  description: String (required) - **Admin can update**
  price: Number (required)
  category: String (required) // jewelry, textiles, pottery, etc.
  images: [String] (array of image URLs)
  stock: Number (default: 0)
  isActive: Boolean (default: true)
  weight: Number (optional)
  dimensions: { length, width, height } (optional)
  tags: [String] (searchable tags)
  slug: String (auto-generated SEO-friendly)
  createdAt: Date
  updatedAt: Date
}
```

### Cart Model ✅ IMPLEMENTED
```javascript
{
  userId: ObjectId (reference to User, unique)
  items: [{
    productId: ObjectId (reference to Product)
    quantity: Number (required, min: 1)
    price: Number (required, min: 0)
    addedAt: Date (default: now)
  }]
  totalItems: Number (calculated automatically)
  totalAmount: Number (calculated automatically)
  updatedAt: Date
  createdAt: Date
}
```

### Order Model ✅ IMPLEMENTED
```javascript
{
  userId: ObjectId (reference to User)
  orderNumber: String (auto-generated: ORD-YYYYMMDD-XXXXXX)
  items: [{
    productId: ObjectId (reference to Product)
    name: String (product name snapshot)
    price: Number (price at time of order)
    quantity: Number
    totalPrice: Number (price * quantity)
  }]
  shippingAddress: {
    title: String (required)
    street: String (required)
    city: String (required)
    state: String (required)
    zipCode: String (required)
    country: String (default: 'India')
    phone: String (optional)
  }
  totalItems: Number (required)
  totalAmount: Number (required)
  shippingFee: Number (default: 0)
  taxAmount: Number (default: 0)
  finalAmount: Number (calculated: totalAmount + shippingFee + taxAmount)
  paymentMethod: String (card/upi/cod)
  paymentStatus: String (pending/completed/failed/refunded)
  orderStatus: String (pending/confirmed/processing/shipped/delivered/cancelled)
  paymentId: String (optional, for payment gateway)
  notes: String (user notes, max 500 chars)
  adminNotes: String (admin notes, max 1000 chars)
  statusHistory: [{
    status: String (required)
    timestamp: Date (default: now)
    updatedBy: String (system/admin/user)
    note: String (optional)
  }]
  createdAt: Date
  updatedAt: Date
}
```

## Development Timeline

- **Week 1**: Backend Modules 1-4 (Server setup, Database, Authentication, Products)
  - ✅ Module 1 Complete - Server running with health endpoints
  - ✅ Module 2 Complete - MongoDB connected, User model with authentication features
  - ✅ Module 3 Complete - Full JWT authentication system with email verification
  - ✅ Module 4 Complete - Full product CRUD with admin controls and description updates
- **Week 2**: Backend Modules 5-8 (User Profiles, File Upload, Cart & Orders, Advanced Search)
  - ✅ User Profile System Complete - Profile and address management
  - ✅ Module 5 Complete - File upload system with avatar and product images
  - ✅ Module 6 Complete - Shopping cart and order management with admin panel
  - ✅ Module 8 Complete - Advanced search and filtering API
- **Week 3**: Frontend Foundation (Module 9)
  - ✅ Module 9 Complete - React + Vite + Redux + Tailwind foundation
  - ✅ Interactive homepage with carousel functionality
  - ✅ Component architecture and API integration
  - ✅ Responsive design and mobile-first approach
- **Week 4**: Frontend Development (Modules 10-11)
  - � Module 10 - Product catalog, search functionality, and product details
  - 📋 Module 11 - Shopping cart UI and checkout process
- **Week 5**: Advanced Frontend (Modules 12-14)
  - � Module 12 - User dashboard and order management UI
  - � Module 13 - Admin panel and management interface
  - � Module 14 - Production deployment and optimization

## Progress Report

### Completed Modules (July 23, 2025)

#### ✅ Module 1: Project Setup & Basic Server
- **Duration**: Completed in 1 day
- **What was implemented**: Express.js server, health endpoints, environment config, development workflow
- **Key achievements**: Clean code structure, proper middleware, CORS configuration

#### ✅ Module 2: Database Setup & User Model
- **Duration**: Completed in 1 day  
- **What was implemented**: MongoDB Atlas connection, User model with auth features, password hashing, token systems
- **Key achievements**: 11/11 database tests passing, secure password handling, clean connection management

#### ✅ Module 3: Authentication System
- **Duration**: Completed in 1 day
- **What was implemented**: Complete JWT authentication with 6 endpoints, email verification, password reset
- **Key achievements**: 8/8 auth tests passing, Gmail SMTP integration, production-ready security

#### ✅ Module 4: Product Model & CRUD Operations
- **Duration**: Completed in 1 day
- **What was implemented**: 
  - Complete Product model with 8 categories and comprehensive validation
  - Admin authorization middleware for secure product management
  - Full CRUD operations (Create, Read, Update, Delete) with proper error handling
  - Advanced search and filtering capabilities with text search
  - Product description editing functionality for admins
  - Stock management with automatic tracking
  - RESTful API endpoints (4 public, 3 admin-protected)
- **Key achievements**:
  - **12/12 tests passing** - All product operations working perfectly
  - **Admin Description Updates**: ✅ Confirmed working - Admin can update product descriptions, names, prices, categories, stock levels
  - Database optimization with search indexes
  - Comprehensive input validation and error handling
  - Perfect integration with existing authentication system

#### ✅ Module 5: File Upload System
- **Duration**: Completed in 1 day
- **What was implemented**: Avatar selection system, product image management, file validation, static file serving
- **Key achievements**: 12/12 tests passing, secure file handling, production-ready image management

#### ✅ Module 6: Shopping Cart & Order Management
- **Duration**: Completed in 1 day
- **What was implemented**: Complete cart system, order processing, admin panel, order tracking
- **Key achievements**: 10/10 tests passing, full e-commerce workflow, admin order management

#### ✅ Module 8: Advanced Search & Filter API
- **Duration**: Completed in 1 day
- **What was implemented**: Advanced search with filters, sorting, pagination, search analytics
- **Key achievements**: 13/13 tests passing, comprehensive search capabilities

#### ✅ Module 9: Frontend Foundation (NEW)
- **Duration**: Completed in 3 days
- **What was implemented**: 
  - Modern React 18 + Vite development environment
  - Redux Toolkit state management with 5 slices (auth, products, cart, user, orders)
  - Tailwind CSS responsive design system
  - React Router DOM with protected routes and lazy loading
  - Axios configuration with interceptors and error handling
  - Interactive homepage with 3-slide carousel featuring auto-play and pause-on-hover
  - Component-based architecture with Layout, ProtectedRoute, and page components
  - Complete API integration with backend (products, categories, authentication)
  - Responsive mobile-first design approach
- **Key achievements**:
  - **CSS Conflict Resolution**: Successfully resolved Tailwind/custom CSS conflicts
  - **Carousel Implementation**: Smooth infinite transitions, proper content positioning, visible navigation
  - **State Management**: Comprehensive Redux setup with async thunks and selectors
  - **API Integration**: Seamless connection to backend with error handling
  - **Responsive Design**: Mobile-first approach working across all screen sizes
  - **Component Architecture**: Reusable, maintainable component structure

**Admin Product Management Capabilities**:
- ✅ Create new products with full details
- ✅ Update ALL product fields including descriptions
- ✅ Delete products with proper authorization
- ✅ Search and filter products in admin interface
- ✅ Stock management and inventory control
- ✅ Category management and validation
- ✅ Image handling (ready for Module 5)

### Current Status Summary
- **Backend Foundation**: 100% Complete and Production-Ready
- **Frontend Foundation**: ✅ Complete - React app with interactive features
- **Authentication System**: Fully functional with email verification
- **Product Management**: Complete CRUD system with admin controls
- **Shopping System**: Cart and order management fully operational
- **Search System**: Advanced filtering and search capabilities
- **User Interface**: Modern responsive design with interactive components
- **Database**: Optimized with proper indexing and validation
- **Testing**: Comprehensive test suites with 100% pass rates
- **Security**: JWT-based auth with proper authorization levels

### Next Priorities
1. **Module 10**: Product Catalog & Search (Frontend) - Connect search UI to Module 8 backend
2. **Module 11**: Shopping Cart & Checkout (Frontend) - Complete e-commerce flow
3. **Module 7**: Payment Gateway Integration (Backend) - Cards, UPI, COD

## Learning Objectives

This project demonstrates:
- Full-stack JavaScript development
- RESTful API design and implementation
- Database design and management with relationships
- Authentication and authorization systems
- Product management and e-commerce functionality
- Payment gateway integration
- File upload handling
- User profile management
- Responsive web design
- Production deployment and security

## Contributing

This is an educational project for interview and resume purposes. The code is kept simple and well-documented for learning purposes.

## License

This project is for educational and portfolio purposes.

## Author

Developed as part of MERN stack learning journey and interview preparation.





 Created verified user: test@example.com | password: password123
 Created unverified user: unverified@example.com | password: password123
3
\n Test Users Created Successfully!
\n USER CREDENTIALS:

 1. VERIFIED USER (can login)
    Email: test@example.com
    Password: password123

 2. UNVERIFIED USER (blocked from login)
    Email: unverified@example.com
    Password: password123

 3. ADMIN USER (full access)
    Email: admin@example.com
    Password: admin123