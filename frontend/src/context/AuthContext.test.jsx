import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(localStorage, 'getItem').mockImplementation((key) => {
      if (key === 'user') return JSON.stringify({ email: 'test@test.com', role: 'USER' })
      if (key === 'token') return 'fake-token'
      return null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should provide authentication context', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should login user and update state', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      token: 'new-token',
      email: 'user@test.com',
      role: 'USER'
    })

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('user@test.com', 'password')
    })

    expect(result.current.user).toEqual({ email: 'user@test.com', role: 'USER' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should logout user and clear state', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should throw error when useAuth is used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})
