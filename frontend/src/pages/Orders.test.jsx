import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Orders from './Orders'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect, vi } from 'vitest'
import * as orderService from '../services/orderService'
import * as productService from '../services/productService'

vi.mock('../services/orderService')
vi.mock('../services/productService')

describe('Orders', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', role: 'USER' }))
  })

  it('should render orders page', () => {
    orderService.getMyOrders.mockResolvedValue([])
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('My Orders')).toBeInTheDocument()
  })

  it('should display loading state initially', () => {
    orderService.getMyOrders.mockImplementation(() => new Promise(() => {}))
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display orders when fetched', async () => {
    const mockOrders = [
      {
        id: 1,
        status: 'PENDING',
        createdAt: '2024-01-01T10:00:00',
        products: [{ id: 1, name: 'Product 1' }],
        notes: 'Test order'
      }
    ]
    orderService.getMyOrders.mockResolvedValue(mockOrders)
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeInTheDocument()
      expect(screen.getByText('PENDING')).toBeInTheDocument()
    })
  })

  it('should show create order button', () => {
    orderService.getMyOrders.mockResolvedValue([])
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Create Order')).toBeInTheDocument()
  })

  it('should display empty state when no orders', async () => {
    orderService.getMyOrders.mockResolvedValue([])
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument()
    })
  })
})
