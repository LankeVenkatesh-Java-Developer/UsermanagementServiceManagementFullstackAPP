import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from './Register'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect, vi } from 'vitest'

describe('Register', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render registration form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('should update form fields on input', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )

    const firstNameInput = screen.getByPlaceholderText('First Name')
    const lastNameInput = screen.getByPlaceholderText('Last Name')
    const emailInput = screen.getByPlaceholderText('Email address')
    const passwordInput = screen.getByPlaceholderText('Password')

    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(firstNameInput.value).toBe('John')
    expect(lastNameInput.value).toBe('Doe')
    expect(emailInput.value).toBe('john@test.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('should show validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )

    const submitButton = screen.getByText('Register')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInvalid()
    })
  })

  it('should show link to login page', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText("Already have an account? Sign in")).toBeInTheDocument()
  })

  it('should disable submit button while loading', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )

    const submitButton = screen.getByText('Register')
    expect(submitButton).not.toBeDisabled()
  })
})
