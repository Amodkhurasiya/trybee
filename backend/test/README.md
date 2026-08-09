# Test Suite Documentation

This folder contains all test files for the Trybee backend application.

## How to Run Tests

Use the npm scripts from the backend root directory:

```bash
# Module-specific tests
npm run test:module1  # Server setup tests
npm run test:module2  # Database and User model tests  
npm run test:module3  # Authentication system tests (includes email verification flow)
npm run test:module4  # Product CRUD operations tests
npm run test:module5  # File upload system tests

# Authentication flow tests
npm run test:auth     # Complete authentication flow test
npm run test:email    # Email service tests

# Utility commands
npm run test:cleanup  # Clean up test data from database
npm run test:db       # Test database connection
```

## Test Files

### Module Tests
- **test-server.js** - Tests basic server functionality, health endpoints
- **test-module2.js** - Tests MongoDB connection, User model, password hashing
- **test-module3.js** - Tests JWT authentication system
- **test-module3-simple.js** - Core authentication tests without email

### Authentication Tests
- **test-complete-flow.js** - End-to-end authentication flow test
- **test-complete-auth-with-email.js** - Complete auth system with real emails
- **test-auth-api.js** - API endpoint testing through HTTP requests
- **test-direct-http.js** - Direct HTTP request testing
- **test-email-service.js** - Email service functionality tests

### Utilities
- **cleanup-test-data.js** - Utility to clean test users from database

## Test Data

All tests use email addresses ending with:
- `@trybee.com`
- `@trybee.me`

Test users are automatically cleaned up after tests complete.

## Running Individual Tests

You can also run tests directly:

```bash
# From backend directory
node test/test-complete-flow.js
node test/test-email-service.js
node test/cleanup-test-data.js
```

## Email Testing

For email tests to work, you need valid Gmail credentials in your `.env` file:
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail App Password (not regular password)

See the main README.md for email setup instructions.
