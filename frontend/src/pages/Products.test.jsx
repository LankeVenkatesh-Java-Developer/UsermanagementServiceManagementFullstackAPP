import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Products from './Products'
import { AuthProvider } from '../context/AuthContext'
import { describe, it, expect, vi } from 'vitest'
import * as productService from '../services/productService'

vi.mock('../services/productService')

describe('Products', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', role: 'USER' }))
  })

  it('should render products page', () => {
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Products />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('should display loading state initially', () => {
    productService.getAllProducts.mockImplementation(() => new Promise(() => {}))

    render(
      <BrowserRouter>
        <AuthProvider>
          <Products />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display products when fetched', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', description: 'Description 1', price: 10.99 },
      { id: 2, name: 'Product 2', description: 'Description 2', price: 20.99 }
    ]
    productService.getAllProducts.mockResolvedValue(mockProducts)

    render(
      <BrowserRouter>
        <AuthProvider>
          <Products />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
      expect(screen.getByText('Product 2')).toBeInTheDocument()
    })
  })

  it('should show add product button for admin users', () => {
    localStorage.setItem('user', JSON.stringify({ email: 'admin@test.com', role: 'ADMIN' }))
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Products />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Add Product')).toBeInTheDocument()
  })

  it('should not show add product button for regular users', () => {
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Products />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.queryByText('Add Product')).not.toBeInTheDocument()
  })

  it('should display empty state when no products', async () => {
    productService.getAllProducts.mockResolvedValue([])

    render(
      <BrowserRouter>
        <AuthProvider>
          <Products />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No products available')).toBeInTheDocument()
    })
  })
})
