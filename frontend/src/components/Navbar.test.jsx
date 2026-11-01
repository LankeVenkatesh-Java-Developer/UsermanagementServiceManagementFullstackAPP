import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect, vi } from 'vitest'

describe('Navbar', () => {
  it('should render navigation links when not authenticated', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('should render user-specific links when authenticated', () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', role: 'USER' }))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('My Orders')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should render admin link when user is admin', () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'ADMIN' }))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('should logout when logout button is clicked', () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', role: 'USER' }))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    )

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('should display user email and role when authenticated', () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', role: 'USER' }))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('test@test.com')).toBeInTheDocument()
    expect(screen.getByText('USER')).toBeInTheDocument()
  })
})
