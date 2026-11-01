import { describe, it, expect, vi } from 'vitest'
import * as adminService from './adminService'
import api from '../utils/api'

vi.mock('../utils/api')

describe('adminService', () => {
  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com', role: 'USER' },
        { id: 2, email: 'user2@test.com', role: 'ADMIN' }
      ]
      api.get.mockResolvedValue({ data: mockUsers })

      const result = await adminService.getAllUsers()

      expect(api.get).toHaveBeenCalledWith('/admin/users')
      expect(result).toEqual(mockUsers)
    })
  })

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      api.delete.mockResolvedValue({})

      await adminService.deleteUser(1)

      expect(api.delete).toHaveBeenCalledWith('/admin/users/1')
    })
  })

  describe('getAllOrders', () => {
    it('should fetch all orders', async () => {
      const mockOrders = [
        { id: 1, status: 'PENDING', user: { email: 'user1@test.com' } },
        { id: 2, status: 'COMPLETED', user: { email: 'user2@test.com' } }
      ]
      api.get.mockResolvedValue({ data: mockOrders })

      const result = await adminService.getAllOrders()

      expect(api.get).toHaveBeenCalledWith('/admin/orders')
      expect(result).toEqual(mockOrders)
    })
  })
})
