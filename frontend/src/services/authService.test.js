import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as authService from './authService'
import api from '../utils/api'

vi.mock('../utils/api')

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should login user and store token', async () => {
      const mockResponse = {
        data: {
          token: 'fake-jwt-token',
          email: 'test@test.com',
          role: 'USER'
        }
      }
      api.post.mockResolvedValue(mockResponse)

      const result = await authService.login('test@test.com', 'password')

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password'
      })
      expect(localStorage.getItem('token')).toBe('fake-jwt-token')
      expect(result).toEqual(mockResponse.data)
    })

    it('should store user data in localStorage', async () => {
      const mockResponse = {
        data: {
          token: 'fake-jwt-token',
          email: 'test@test.com',
          role: 'ADMIN'
        }
      }
      api.post.mockResolvedValue(mockResponse)

      await authService.login('test@test.com', 'password')

      const user = JSON.parse(localStorage.getItem('user'))
      expect(user).toEqual({
        email: 'test@test.com',
        role: 'ADMIN'
      })
    })
  })

  describe('register', () => {
    it('should register new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123'
      }
      const mockResponse = { data: { message: 'User registered successfully' } }
      api.post.mockResolvedValue(mockResponse)

      const result = await authService.register(userData)

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }))

      authService.logout()

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return user data from localStorage', () => {
      const userData = { email: 'test@test.com', role: 'USER' }
      localStorage.setItem('user', JSON.stringify(userData))

      const result = authService.getCurrentUser()

      expect(result).toEqual(userData)
    })

    it('should return null when no user in localStorage', () => {
      const result = authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'fake-token')

      const result = authService.getToken()

      expect(result).toBe('fake-token')
    })

    it('should return null when no token in localStorage', () => {
      const result = authService.getToken()

      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'fake-token')

      const result = authService.isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when token does not exist', () => {
      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
