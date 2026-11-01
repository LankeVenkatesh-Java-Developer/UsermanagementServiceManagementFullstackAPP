import { describe, it, expect, vi } from 'vitest'
import * as orderService from './orderService'
import api from '../utils/api'

vi.mock('../utils/api')

describe('orderService', () => {
  describe('createOrder', () => {
    it('should create new order', async () => {
      const orderData = { productIds: [1, 2], notes: 'Test order' }
      const mockOrder = { id: 1, status: 'PENDING', ...orderData }
      api.post.mockResolvedValue({ data: mockOrder })

      const result = await orderService.createOrder(orderData)

      expect(api.post).toHaveBeenCalledWith('/orders', orderData)
      expect(result).toEqual(mockOrder)
    })
  })

  describe('getMyOrders', () => {
    it('should fetch current user orders', async () => {
      const mockOrders = [
        { id: 1, status: 'PENDING', products: [] },
        { id: 2, status: 'COMPLETED', products: [] }
      ]
      api.get.mockResolvedValue({ data: mockOrders })

      const result = await orderService.getMyOrders()

      expect(api.get).toHaveBeenCalledWith('/orders/my-orders')
      expect(result).toEqual(mockOrders)
    })
  })

  describe('getOrderById', () => {
    it('should fetch order by id', async () => {
      const mockOrder = { id: 1, status: 'PENDING', products: [] }
      api.get.mockResolvedValue({ data: mockOrder })

      const result = await orderService.getOrderById(1)

      expect(api.get).toHaveBeenCalledWith('/orders/1')
      expect(result).toEqual(mockOrder)
    })
  })
})
