import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { describe, it, expect, vi } from 'vitest'

const TestComponent = () => <div>Protected Content</div>

const createWrapper = (isAuthenticated = true, userRole = 'USER') => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>
        <TestAuthProvider isAuthenticated={isAuthenticated} userRole={userRole}>
          {children}
        </TestAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
  return Wrapper
}

const TestAuthProvider = ({ children, isAuthenticated, userRole }) => {
  const auth = useAuth()
  auth.isAuthenticated = isAuthenticated
  auth.user = isAuthenticated ? { email: 'test@test.com', role: userRole } : null
  auth.loading = false
  return <>{children}</>
}

describe('ProtectedRoute', () => {
  it('should render protected component when authenticated', () => {
    render(
      <Routes>
        <Route path="/protected" element={
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        } />
      </Routes>,
      { wrapper: createWrapper(true, 'USER') }
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', () => {
    render(
      <Routes>
        <Route path="/protected" element={
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { wrapper: createWrapper(false) }
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should redirect when user does not have required role', () => {
    render(
      <Routes>
        <Route path="/protected" element={
          <ProtectedRoute requiredRole="ADMIN">
            <TestComponent />
          </ProtectedRoute>
        } />
        <Route path="/products" element={<div>Products Page</div>} />
      </Routes>,
      { wrapper: createWrapper(true, 'USER') }
    )

    expect(screen.getByText('Products Page')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    const LoadingWrapper = ({ children }) => (
      <BrowserRouter>
        <AuthProvider>
          <TestAuthProvider isAuthenticated={false} userRole="USER" loading={true}>
            {children}
          </TestAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    )

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      { wrapper: LoadingWrapper }
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
