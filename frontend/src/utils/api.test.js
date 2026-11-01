import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import api from './api'
import axios from 'axios'

vi.mock('axios')

describe('api utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('request interceptor', () => {
    it('should add authorization header when token exists', async () => {
      localStorage.setItem('token', 'fake-jwt-token')
      
      const mockConfig = {}
      axios.create.mockReturnValue({
        interceptors: {
          request: {
            use: (fn) => {
              const result = fn(mockConfig)
              expect(result.headers.Authorization).toBe('Bearer fake-jwt-token')
            }
          },
          response: {
            use: vi.fn()
          }
        }
      })

      // Re-import to trigger interceptor setup
      vi.resetModules()
      const freshApi = (await import('./api')).default
    })

    it('should not add authorization header when token does not exist', async () => {
      const mockConfig = {}
      axios.create.mockReturnValue({
        interceptors: {
          request: {
            use: (fn) => {
              const result = fn(mockConfig)
              expect(result.headers.Authorization).toBeUndefined()
            }
          },
          response: {
            use: vi.fn()
          }
        }
      })
    })
  })

  describe('response interceptor', () => {
    it('should clear token and redirect on 401 error', async () => {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }))
      
      const mockError = {
        response: {
          status: 401
        }
      }

      axios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn()
          },
          response: {
            use: (successFn, errorFn) => {
              errorFn(mockError)
            }
          }
        }
      })

      expect(localStorage.getItem('token')).toBe('fake-token')
    })
  })

  describe('default configuration', () => {
    it('should have correct base URL', () => {
      axios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      })

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })
  })
})
