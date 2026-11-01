import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect, vi } from 'vitest'
import * as adminService from '../services/adminService'

vi.mock('../services/adminService')

describe('AdminDashboard', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'ADMIN' }))
  })

  it('should render admin dashboard', () => {
    adminService.getAllUsers.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })

  it('should display users tab by default', () => {
    adminService.getAllUsers.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('should switch to orders tab when clicked', async () => {
    adminService.getAllUsers.mockResolvedValue([])
    adminService.getAllOrders.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    const ordersTab = screen.getByText('All Orders')
    fireEvent.click(ordersTab)

    await waitFor(() => {
      expect(adminService.getAllOrders).toHaveBeenCalled()
    })
  })

  it('should display users when fetched', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@test.com', firstName: 'John', lastName: 'Doe', role: 'USER', enabled: true },
      { id: 2, email: 'user2@test.com', firstName: 'Jane', lastName: 'Smith', role: 'ADMIN', enabled: true }
    ]
    adminService.getAllUsers.mockResolvedValue(mockUsers)

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('user1@test.com')).toBeInTheDocument()
      expect(screen.getByText('user2@test.com')).toBeInTheDocument()
    })
  })

  it('should display orders when fetched', async () => {
    const mockOrders = [
      {
        id: 1,
        status: 'COMPLETED',
        createdAt: '2024-01-01T10:00:00',
        user: { email: 'user@test.com' },
        products: [{ id: 1, name: 'Product 1' }]
      }
    ]
    adminService.getAllOrders.mockResolvedValue(mockOrders)

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    const ordersTab = screen.getByText('All Orders')
    fireEvent.click(ordersTab)

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeInTheDocument()
    })
  })
})
