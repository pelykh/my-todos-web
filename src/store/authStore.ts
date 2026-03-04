import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  token: string | null
  email: string | null
  apiUrl: string
  setApiUrl: (url: string) => void
  logout: () => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      apiUrl: 'http://localhost:8000',

      setApiUrl: (url) => set({ apiUrl: url }),

      logout: () => set({ token: null, email: null }),

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
        set({ token: access_token, email })
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
        set({ token: access_token, email })
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({ token: s.token, email: s.email, apiUrl: s.apiUrl }),
    },
  ),
)
