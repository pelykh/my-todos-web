import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  token: string | null
  email: string | null
  apiUrl: string
  tokenExpiresAt: string | null
  sessionExpired: boolean
  setApiUrl: (url: string) => void
  logout: () => void
  handleUnauthorized: () => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      apiUrl: 'http://localhost:8000',
      tokenExpiresAt: null,
      sessionExpired: false,

      setApiUrl: (url) => set({ apiUrl: url }),

      logout: () => set({ token: null, email: null, tokenExpiresAt: null }),

      handleUnauthorized: () => set({ token: null, email: null, tokenExpiresAt: null, sessionExpired: true }),

      login: async (email, password) => {
        const res = await fetch(`${get().apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error((err as { detail?: string }).detail ?? 'Login failed')
        }
        const { access_token } = (await res.json()) as { access_token: string }
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 3)
        set({ token: access_token, email, tokenExpiresAt: expiresAt.toISOString(), sessionExpired: false })
      },

      register: async (email, password) => {
        const res = await fetch(`${get().apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error((err as { detail?: string }).detail ?? 'Registration failed')
        }
        const { access_token } = (await res.json()) as { access_token: string }
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 3)
        set({ token: access_token, email, tokenExpiresAt: expiresAt.toISOString(), sessionExpired: false })
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({ token: s.token, email: s.email, apiUrl: s.apiUrl, tokenExpiresAt: s.tokenExpiresAt }),
    },
  ),
)
