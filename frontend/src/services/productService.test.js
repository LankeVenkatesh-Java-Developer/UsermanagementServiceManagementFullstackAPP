import { describe, it, expect, vi } from 'vitest'
import * as productService from './productService'
import api from '../utils/api'

vi.mock('../utils/api')

describe('productService', () => {
  describe('getAllProducts', () => {
    it('should fetch all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10.99 },
        { id: 2, name: 'Product 2', price: 20.99 }
      ]
      api.get.mockResolvedValue({ data: mockProducts })

      const result = await productService.getAllProducts()

      expect(api.get).toHaveBeenCalledWith('/products')
      expect(result).toEqual(mockProducts)
    })
  })

  describe('getProductById', () => {
    it('should fetch product by id', async () => {
      const mockProduct = { id: 1, name: 'Product 1', price: 10.99 }
      api.get.mockResolvedValue({ data: mockProduct })

      const result = await productService.getProductById(1)

      expect(api.get).toHaveBeenCalledWith('/products/1')
      expect(result).toEqual(mockProduct)
    })
  })

  describe('createProduct', () => {
    it('should create new product', async () => {
      const productData = { name: 'New Product', description: 'Description', price: 15.99 }
      const mockProduct = { id: 1, ...productData }
      api.post.mockResolvedValue({ data: mockProduct })

      const result = await productService.createProduct(productData)

      expect(api.post).toHaveBeenCalledWith('/products', productData)
      expect(result).toEqual(mockProduct)
    })
  })

  describe('updateProduct', () => {
    it('should update existing product', async () => {
      const productData = { name: 'Updated Product', description: 'Updated Description', price: 25.99 }
      const mockProduct = { id: 1, ...productData }
      api.put.mockResolvedValue({ data: mockProduct })

      const result = await productService.updateProduct(1, productData)

      expect(api.put).toHaveBeenCalledWith('/products/1', productData)
      expect(result).toEqual(mockProduct)
    })
  })

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      api.delete.mockResolvedValue({})

      await productService.deleteProduct(1)

      expect(api.delete).toHaveBeenCalledWith('/products/1')
    })
  })
})
