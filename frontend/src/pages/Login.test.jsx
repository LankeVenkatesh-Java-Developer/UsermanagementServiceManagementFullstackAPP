import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect, vi } from 'vitest'

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    const submitButton = screen.getByText('Sign in')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email address')).toBeInvalid()
    })
  })

  it('should update form fields on input', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@test.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('should show link to register page', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText("Don't have an account? Register")).toBeInTheDocument()
  })

  it('should disable submit button while loading', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    const submitButton = screen.getByText('Sign in')
    expect(submitButton).not.toBeDisabled()
  })
})
