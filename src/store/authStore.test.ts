import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './authStore'

beforeEach(() => {
  useAuthStore.setState({ token: null, email: null, apiUrl: 'http://localhost:8000' })
  vi.restoreAllMocks()
})

describe('setApiUrl', () => {
  it('updates the API URL', () => {
    useAuthStore.getState().setApiUrl('http://example.com')
    expect(useAuthStore.getState().apiUrl).toBe('http://example.com')
  })
})

describe('logout', () => {
  it('clears token and email', () => {
    useAuthStore.setState({ token: 'tok', email: 'a@b.com' })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().email).toBeNull()
  })
})

describe('login', () => {
  it('stores token on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'tok123' }),
      }),
    )
    await useAuthStore.getState().login('a@b.com', 'pass1234')
    expect(useAuthStore.getState().token).toBe('tok123')
    expect(useAuthStore.getState().email).toBe('a@b.com')
  })

  it('throws on failed login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      }),
    )
    await expect(useAuthStore.getState().login('a@b.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    )
  })
})

describe('register', () => {
  it('stores token on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'newtok' }),
      }),
    )
    await useAuthStore.getState().register('new@b.com', 'pass1234')
    expect(useAuthStore.getState().token).toBe('newtok')
    expect(useAuthStore.getState().email).toBe('new@b.com')
  })
})
