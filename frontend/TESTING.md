# Testing Guide

This document provides comprehensive information about the unit tests for the User Management Frontend application.

## Testing Infrastructure

The application uses **Vitest** as the test runner with **React Testing Library** for component testing and **jsdom** for DOM simulation.

### Installed Testing Dependencies

- `vitest` - Fast unit test framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM elements
- `@testing-library/user-event` - User interaction simulation
- `@vitest/coverage-v8` - Code coverage reporting
- `@vitest/ui` - Visual test runner UI
- `jsdom` - DOM implementation for Node.js

## Test Scripts

```bash
# Run all tests
npm test

# Run tests with visual UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── components/
│   ├── Navbar.test.jsx
│   └── ProtectedRoute.test.jsx
├── context/
│   └── AuthContext.test.jsx
├── pages/
│   ├── Login.test.jsx
│   ├── Register.test.jsx
│   ├── Products.test.jsx
│   ├── Orders.test.jsx
│   └── AdminDashboard.test.jsx
├── services/
│   ├── authService.test.js
│   ├── productService.test.js
│   ├── orderService.test.js
│   └── adminService.test.js
├── utils/
│   └── api.test.js
└── test/
    └── setup.js
```

## Test Coverage

### Component Tests (7 files)

1. **AuthContext.test.jsx**
   - Authentication context provider functionality
   - Login/logout state management
   - User authentication status
   - Error handling for context usage outside provider

2. **ProtectedRoute.test.jsx**
   - Route protection based on authentication
   - Role-based access control
   - Redirect behavior for unauthenticated users
   - Loading state display

3. **Navbar.test.jsx**
   - Navigation link rendering based on auth state
   - Admin-specific link display
   - Logout functionality
   - User information display

4. **Login.test.jsx**
   - Form rendering and validation
   - Input field updates
   - Submit button behavior
   - Loading state handling
   - Navigation to register page

5. **Register.test.jsx**
   - Registration form rendering
   - Form field validation
   - Input handling
   - Submit button state
   - Navigation to login page

6. **Products.test.jsx**
   - Product list display
   - Loading state
   - Admin-specific controls (Add/Edit/Delete)
   - Empty state handling
   - Product data rendering

7. **Orders.test.jsx**
   - Order list display
   - Loading state
   - Create order functionality
   - Order status display
   - Empty state handling

8. **AdminDashboard.test.jsx**
   - Dashboard rendering
   - Tab switching (Users/Orders)
   - User list display
   - Order list display
   - Admin-specific functionality

### Service Tests (4 files)

1. **authService.test.js**
   - Login functionality and token storage
   - User registration
   - Logout and token cleanup
   - Current user retrieval
   - Authentication status checking

2. **productService.test.js**
   - Fetch all products
   - Fetch product by ID
   - Create new product
   - Update existing product
   - Delete product

3. **orderService.test.js**
   - Create order
   - Fetch user's orders
   - Fetch order by ID

4. **adminService.test.js**
   - Fetch all users
   - Delete user
   - Fetch all orders

### Utility Tests (1 file)

1. **api.test.js**
   - Axios instance configuration
   - Request interceptor (token injection)
   - Response interceptor (401 handling)
   - Base URL and headers setup

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test src/pages/Login.test.jsx
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

### Run Tests with UI

```bash
npm run test:ui
```

This opens a visual test runner at `http://localhost:51204`

## Test Configuration

### vitest.config.js

- **Environment**: jsdom (for DOM simulation)
- **Setup File**: `src/test/setup.js` (configures testing-library)
- **Coverage Provider**: v8
- **Global Functions**: Enabled (describe, it, expect, etc.)

### src/test/setup.js

Configures:
- `@testing-library/jest-dom` custom matchers
- Automatic cleanup after each test

## Writing New Tests

### Component Test Template

```jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ComponentName from './ComponentName'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect } from 'vitest'

describe('ComponentName', () => {
  it('should render component', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ComponentName />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Service Test Template

```js
import { describe, it, expect, vi } from 'vitest'
import * as serviceName from './serviceName'
import api from '../utils/api'

vi.mock('../utils/api')

describe('serviceName', () => {
  it('should perform action', async () => {
    const mockData = { id: 1, name: 'Test' }
    api.get.mockResolvedValue({ data: mockData })

    const result = await serviceName.functionName()

    expect(api.get).toHaveBeenCalledWith('/endpoint')
    expect(result).toEqual(mockData)
  })
})
```

## Best Practices

1. **Mock External Dependencies**: Always mock API calls and external services
2. **Test User Interactions**: Use `@testing-library/user-event` for simulating user actions
3. **Test Loading States**: Verify loading states are displayed appropriately
4. **Test Error States**: Ensure error handling works correctly
5. **Use Descriptive Test Names**: Make test names describe what is being tested
6. **Arrange-Act-Assert Pattern**: Structure tests clearly with setup, execution, and verification
7. **Clean Up**: Use `afterEach` to clean up side effects (localStorage, mocks)
8. **Test Accessibility**: Ensure components are accessible (labels, ARIA attributes)

## Common Testing Patterns

### Testing Async Operations

```jsx
it('should fetch data async', async () => {
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```jsx
import { fireEvent } from '@testing-library/react'

it('should handle button click', () => {
  render(<Component />)
  
  const button = screen.getByText('Click Me')
  fireEvent.click(button)
  
  expect(screen.getByText('Clicked')).toBeInTheDocument()
})
```

### Mocking localStorage

```js
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('token', 'fake-token')
})
```

## Troubleshooting

### Tests Fail with "window is not defined"

Ensure `vitest.config.js` has `environment: 'jsdom'` configured.

### Tests Fail with "useAuth must be used within an AuthProvider"

Wrap components in `AuthProvider` when testing:

```jsx
<AuthProvider>
  <Component />
</AuthProvider>
```

### Mock Not Working

Ensure mocks are called before importing the module:

```js
vi.mock('../utils/api')
import api from '../utils/api'
```

## Coverage Goals

Aim for:
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

Run `npm run test:coverage` to see current coverage metrics.
