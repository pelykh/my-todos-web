# Sync Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add sync to my-todos-web: offline-first stays intact, login unlocks 5s-debounced push + SSE-driven pull, with overflow menu replacing inline theme/lang toggles.

**Architecture:** LocalStorageTaskService remains source of truth. SyncService is a side-effect layer: subscribes to taskStore, debounces pushes, reacts to SSE change events with pulls. New authStore and syncStore persist state to localStorage via Zustand persist middleware.

**Tech Stack:** React 19, Zustand 5, Mantine 8, Lucide React, `@microsoft/fetch-event-source`, Vitest, FastAPI backend

---

### Task 1: Add CORS to backend

**Files:**
- Modify: `/Users/pelykh/Projects/my-todos/main.py`

**Step 1: Update `main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth, tasks, sync

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(sync.router)


@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

**Step 2: Verify backend still starts**

```bash
cd /Users/pelykh/Projects/my-todos && JWT_SECRET=test ./venv/bin/uvicorn main:app --port 8000 &
sleep 2
curl -s http://localhost:8000/ && pkill -f "uvicorn main:app"
```

Expected: `{"message":"Hello World"}`

**Step 3: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Projects/my-todos add main.py
/usr/bin/git -C /Users/pelykh/Projects/my-todos commit -m "feat: add CORS middleware"
```

---

### Task 2: Install frontend dependency

**Files:**
- Modify: `/Users/pelykh/Work/my-todos-web/package.json`

**Step 1: Install**

```bash
cd /Users/pelykh/Work/my-todos-web && npm install @microsoft/fetch-event-source
```

**Step 2: Verify import works**

```bash
node -e "require('/Users/pelykh/Work/my-todos-web/node_modules/@microsoft/fetch-event-source/lib/cjs/index.js'); console.log('OK')"
```

Expected: `OK`

**Step 3: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add package.json package-lock.json
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add fetch-event-source dependency"
```

---

### Task 3: camelCase ↔ snake_case utilities

**Files:**
- Create: `src/utils/case.ts`
- Create: `src/utils/case.test.ts`

**Step 1: Write the failing test**

Create `src/utils/case.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { objectToCamelCase, objectToSnakeCase } from './case'

describe('objectToSnakeCase', () => {
  it('converts camelCase keys to snake_case', () => {
    expect(objectToSnakeCase({ projectId: '1', isProject: true })).toEqual({
      project_id: '1',
      is_project: true,
    })
  })

  it('handles nested objects', () => {
    expect(objectToSnakeCase({ createdAt: '2026', nested: { dueDate: '2027' } })).toEqual({
      created_at: '2026',
      nested: { due_date: '2027' },
    })
  })

  it('handles arrays', () => {
    expect(objectToSnakeCase([{ projectId: '1' }])).toEqual([{ project_id: '1' }])
  })

  it('passes through primitives unchanged', () => {
    expect(objectToSnakeCase('hello')).toBe('hello')
    expect(objectToSnakeCase(42)).toBe(42)
    expect(objectToSnakeCase(null)).toBe(null)
  })
})

describe('objectToCamelCase', () => {
  it('converts snake_case keys to camelCase', () => {
    expect(objectToCamelCase({ project_id: '1', is_project: true })).toEqual({
      projectId: '1',
      isProject: true,
    })
  })

  it('handles nested objects', () => {
    expect(objectToCamelCase({ created_at: '2026', nested: { due_date: '2027' } })).toEqual({
      createdAt: '2026',
      nested: { dueDate: '2027' },
    })
  })

  it('handles arrays', () => {
    expect(objectToCamelCase([{ project_id: '1' }])).toEqual([{ projectId: '1' }])
  })
})
```

**Step 2: Run — expect failure**

```bash
cd /Users/pelykh/Work/my-todos-web && npx vitest run src/utils/case.test.ts
```

Expected: FAIL — module not found

**Step 3: Create `src/utils/case.ts`**

```ts
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

export function objectToSnakeCase<T>(obj: T): unknown {
  if (Array.isArray(obj)) return obj.map(objectToSnakeCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toSnakeCase(k), objectToSnakeCase(v)]),
    )
  }
  return obj
}

export function objectToCamelCase<T>(obj: T): unknown {
  if (Array.isArray(obj)) return obj.map(objectToCamelCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamelCase(k), objectToCamelCase(v)]),
    )
  }
  return obj
}
```

**Step 4: Run — expect pass**

```bash
cd /Users/pelykh/Work/my-todos-web && npx vitest run src/utils/case.test.ts
```

Expected: all PASS

**Step 5: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/utils/case.ts src/utils/case.test.ts
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add camelCase/snake_case conversion utilities"
```

---

### Task 4: authStore

**Files:**
- Create: `src/store/authStore.ts`
- Create: `src/store/authStore.test.ts`

**Step 1: Write the failing test**

Create `src/store/authStore.test.ts`:

```ts
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
  })
})
```

**Step 2: Run — expect failure**

```bash
cd /Users/pelykh/Work/my-todos-web && npx vitest run src/store/authStore.test.ts
```

Expected: FAIL — module not found

**Step 3: Create `src/store/authStore.ts`**

```ts
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
```

**Step 4: Run — expect pass**

```bash
cd /Users/pelykh/Work/my-todos-web && npx vitest run src/store/authStore.test.ts
```

Expected: all PASS

**Step 5: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/store/authStore.ts src/store/authStore.test.ts
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add authStore (JWT + API URL)"
```

---

### Task 5: syncStore

**Files:**
- Create: `src/store/syncStore.ts`

**Step 1: Create `src/store/syncStore.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SyncState = {
  lastSyncVersion: number
  isSyncing: boolean
  lastSyncedAt: string | null
  error: string | null
  setLastSyncVersion: (v: number) => void
  setSyncing: (v: boolean) => void
  setSyncedAt: (d: string) => void
  setError: (e: string | null) => void
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      lastSyncVersion: 0,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,
      setLastSyncVersion: (v) => set({ lastSyncVersion: v }),
      setSyncing: (v) => set({ isSyncing: v }),
      setSyncedAt: (d) => set({ lastSyncedAt: d }),
      setError: (e) => set({ error: e }),
    }),
    {
      name: 'sync',
      partialize: (s) => ({ lastSyncVersion: s.lastSyncVersion }),
    },
  ),
)
```

**Step 2: Verify it imports cleanly**

```bash
cd /Users/pelykh/Work/my-todos-web && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to syncStore

**Step 3: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/store/syncStore.ts
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add syncStore"
```

---

### Task 6: Export taskStore and create ApiClient

**Files:**
- Modify: `src/store/taskStore.ts` (export taskStore)
- Create: `src/services/ApiClient.ts`
- Create: `src/services/ApiClient.test.ts`

**Step 1: Export `taskStore` from `src/store/taskStore.ts`**

Find this line (around line 53):
```ts
const taskStore = createTaskStore(new LocalStorageTaskService())
```
Change it to:
```ts
export const taskStore = createTaskStore(new LocalStorageTaskService())
```

**Step 2: Write failing ApiClient test**

Create `src/services/ApiClient.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from './ApiClient'

beforeEach(() => vi.restoreAllMocks())

describe('pushSync', () => {
  it('converts camelCase to snake_case and returns serverVersion', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ server_version: 5 }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const client = new ApiClient('http://localhost:8000', 'tok')
    const result = await client.pushSync([{ projectId: '1', createdAt: '2026' }])

    expect(result.serverVersion).toBe(5)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.changes[0]).toEqual({ project_id: '1', created_at: '2026' })
  })
})

describe('pullSync', () => {
  it('converts snake_case response to camelCase', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tasks: [{ id: '1', project_id: 'p1', created_at: '2026', server_version: 3 }],
      }),
    }))

    const client = new ApiClient('http://localhost:8000', 'tok')
    const tasks = await client.pullSync(0)

    expect(tasks[0]).toMatchObject({ id: '1', projectId: 'p1', createdAt: '2026' })
  })
})
```

**Step 3: Run — expect failure**

```bash
cd /Users/pelykh/Work/my-todos-web && npx vitest run src/services/ApiClient.test.ts
```

Expected: FAIL — module not found

**Step 4: Create `src/services/ApiClient.ts`**

```ts
import { objectToCamelCase, objectToSnakeCase } from '@/utils/case'
import type { Task } from '@/types'

export class ApiClient {
  constructor(
    private apiUrl: string,
    private token: string,
  ) {}

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }
  }

  async pushSync(tasks: Task[]): Promise<{ serverVersion: number }> {
    const res = await fetch(`${this.apiUrl}/sync`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ changes: tasks.map(objectToSnakeCase) }),
    })
    if (!res.ok) throw new Error(`Push sync failed: ${res.status}`)
    const data = (await res.json()) as { server_version: number }
    return { serverVersion: data.server_version }
  }

  async pullSync(since: number): Promise<Task[]> {
    const res = await fetch(`${this.apiUrl}/sync?since=${since}`, {
      headers: this.headers,
    })
    if (!res.ok) throw new Error(`Pull sync failed: ${res.status}`)
    const data = (await res.json()) as { tasks: unknown[] }
    return data.tasks.map(objectToCamelCase) as Task[]
  }
}
```

**Step 5: Run — expect pass**

```bash
cd /Users/pelykh/Work/my-todos-web && npx vitest run src/services/ApiClient.test.ts
```

Expected: all PASS

**Step 6: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/store/taskStore.ts src/services/ApiClient.ts src/services/ApiClient.test.ts
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: export taskStore, add ApiClient with case conversion"
```

---

### Task 7: SyncService + useSyncEffect

**Files:**
- Create: `src/services/SyncService.ts`
- Create: `src/hooks/useSyncEffect.ts`

**Step 1: Create `src/services/SyncService.ts`**

```ts
import { fetchEventSource } from '@microsoft/fetch-event-source'

import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { taskStore } from '@/store/taskStore'
import type { Task } from '@/types'

import { ApiClient } from './ApiClient'

const STORAGE_KEY = 'tasks'

function loadLocalTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Task[]
  } catch {
    return []
  }
}

function saveLocalTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function upsertTasks(existing: Task[], incoming: Task[]): Task[] {
  const map = new Map(existing.map((t) => [t.id, t]))
  for (const t of incoming) map.set(t.id, t)
  return Array.from(map.values())
}

export async function pushSync(): Promise<void> {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  const { setLastSyncVersion, setSyncing, setSyncedAt, setError } = useSyncStore.getState()
  const tasks = taskStore.getState().tasks
  try {
    setSyncing(true)
    setError(null)
    const client = new ApiClient(apiUrl, token)
    const { serverVersion } = await client.pushSync(tasks)
    setLastSyncVersion(serverVersion)
    setSyncedAt(new Date().toISOString())
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Sync failed')
  } finally {
    setSyncing(false)
  }
}

export async function pullSync(): Promise<void> {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  const { lastSyncVersion, setLastSyncVersion, setError } = useSyncStore.getState()
  try {
    const client = new ApiClient(apiUrl, token)
    const incoming = await client.pullSync(lastSyncVersion)
    if (!incoming.length) return
    const existing = loadLocalTasks()
    const merged = upsertTasks(existing, incoming)
    saveLocalTasks(merged)
    taskStore.setState({ tasks: merged })
    const maxVersion = Math.max(
      ...incoming.map((t) => (t as unknown as { serverVersion?: number }).serverVersion ?? 0),
    )
    if (maxVersion > lastSyncVersion) setLastSyncVersion(maxVersion)
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Pull failed')
  }
}

let sseAbortController: AbortController | null = null

export function subscribeSSE(): void {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  disconnectSSE()
  sseAbortController = new AbortController()
  void fetchEventSource(`${apiUrl}/events`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: sseAbortController.signal,
    onmessage(ev) {
      try {
        const data = JSON.parse(ev.data) as { type: string }
        if (data.type === 'change') void pullSync()
      } catch {
        // ignore malformed events
      }
    },
    onerror() {
      // fetchEventSource auto-reconnects; errors handled by syncStore.error via pullSync
    },
  })
}

export function disconnectSSE(): void {
  sseAbortController?.abort()
  sseAbortController = null
}
```

**Step 2: Create `src/hooks/useSyncEffect.ts`**

```ts
import { useEffect } from 'react'

import { disconnectSSE, pushSync, subscribeSSE } from '@/services/SyncService'
import { useAuthStore } from '@/store/authStore'
import { taskStore } from '@/store/taskStore'

const DEBOUNCE_MS = 5000

export function useSyncEffect(): void {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) return

    void pushSync()
    subscribeSSE()

    let timer: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = taskStore.subscribe(() => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void pushSync(), DEBOUNCE_MS)
    })

    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
      disconnectSSE()
    }
  }, [token])
}
```

**Step 3: Type-check**

```bash
cd /Users/pelykh/Work/my-todos-web && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

Expected: no errors in the new files. Fix any that appear.

**Step 4: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/services/SyncService.ts src/hooks/useSyncEffect.ts
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add SyncService and useSyncEffect hook"
```

---

### Task 8: Mount useSyncEffect in root

**Files:**
- Modify: `src/routes/__root.tsx`

**Step 1: Update `__root.tsx`**

```tsx
import '../styles.css'

import { MantineProvider } from '@mantine/core'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { useSyncEffect } from '@/hooks/useSyncEffect'
import { ThemeProvider, useTheme } from '@/theme'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  )
}

function ThemedApp() {
  const { colorScheme } = useTheme()
  useSyncEffect()

  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <Outlet />
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[{ name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> }]}
      />
    </MantineProvider>
  )
}
```

**Step 2: Verify app still builds**

```bash
cd /Users/pelykh/Work/my-todos-web && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

Expected: no errors

**Step 3: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/routes/__root.tsx
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: mount useSyncEffect in root"
```

---

### Task 9: OverflowMenu + SettingsModal

**Files:**
- Create: `src/components/OverflowMenu.tsx`
- Create: `src/components/SettingsModal.tsx`

**Step 1: Create `src/components/OverflowMenu.tsx`**

```tsx
import { ActionIcon, Menu, SegmentedControl, Stack, Text } from '@mantine/core'
import { Moon, MoreHorizontal, Settings, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/theme'

interface OverflowMenuProps {
  onSettings: () => void
}

const LANGS = [
  { value: 'en', label: 'EN' },
  { value: 'uk', label: 'UK' },
]

export function OverflowMenu({ onSettings }: OverflowMenuProps) {
  const { colorScheme, toggleColorScheme } = useTheme()
  const { i18n, t } = useTranslation()
  const current = LANGS.some((l) => l.value === i18n.language) ? i18n.language : 'en'

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="default" size="lg" radius="md" aria-label="More options">
          <MoreHorizontal size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={colorScheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          onClick={toggleColorScheme}
        >
          {colorScheme === 'dark' ? t('ariaThemeLight') : t('ariaThemeDark')}
        </Menu.Item>
        <Menu.Item closeMenuOnClick={false}>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('ariaLangSelect')}
            </Text>
            <SegmentedControl
              size="xs"
              value={current}
              onChange={(val) => void i18n.changeLanguage(val)}
              data={LANGS}
            />
          </Stack>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<Settings size={16} />} onClick={onSettings}>
          Settings
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
```

**Step 2: Create `src/components/SettingsModal.tsx`**

```tsx
import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { useState } from 'react'

import { useAuthStore } from '@/store/authStore'

interface SettingsModalProps {
  opened: boolean
  onClose: () => void
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { apiUrl, setApiUrl } = useAuthStore()
  const [value, setValue] = useState(apiUrl)

  function handleSave() {
    setApiUrl(value.trim() || 'http://localhost:8000')
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Settings">
      <Stack>
        <TextInput
          label="Backend URL"
          description="URL of your my-todos backend server"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          placeholder="http://localhost:8000"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <Button onClick={handleSave}>Save</Button>
      </Stack>
    </Modal>
  )
}
```

**Step 3: Type-check**

```bash
cd /Users/pelykh/Work/my-todos-web && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

Expected: no errors

**Step 4: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/components/OverflowMenu.tsx src/components/SettingsModal.tsx
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add OverflowMenu and SettingsModal"
```

---

### Task 10: LoginModal + RegisterModal

**Files:**
- Create: `src/components/LoginModal.tsx`
- Create: `src/components/RegisterModal.tsx`

**Step 1: Create `src/components/LoginModal.tsx`**

```tsx
import { Alert, Button, Modal, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'

import { useAuthStore } from '@/store/authStore'

interface LoginModalProps {
  opened: boolean
  onClose: () => void
  onSwitchToRegister: () => void
}

export function LoginModal({ opened, onClose, onSwitchToRegister }: LoginModalProps) {
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Sign in">
      <Stack>
        {error && <Alert color="red">{error}</Alert>}
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          autoFocus
        />
        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
        />
        <Button onClick={() => void handleSubmit()} loading={loading}>
          Sign in
        </Button>
        <Text size="sm" ta="center">
          {"Don't have an account? "}
          <Text
            component="span"
            c="blue"
            style={{ cursor: 'pointer' }}
            onClick={onSwitchToRegister}
          >
            Register
          </Text>
        </Text>
      </Stack>
    </Modal>
  )
}
```

**Step 2: Create `src/components/RegisterModal.tsx`**

```tsx
import { Alert, Button, Modal, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'

import { useAuthStore } from '@/store/authStore'

interface RegisterModalProps {
  opened: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ opened, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await register(email, password)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create account">
      <Stack>
        {error && <Alert color="red">{error}</Alert>}
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          autoFocus
        />
        <PasswordInput
          label="Password"
          description="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
        />
        <Button onClick={() => void handleSubmit()} loading={loading}>
          Create account
        </Button>
        <Text size="sm" ta="center">
          {'Already have an account? '}
          <Text
            component="span"
            c="blue"
            style={{ cursor: 'pointer' }}
            onClick={onSwitchToLogin}
          >
            Sign in
          </Text>
        </Text>
      </Stack>
    </Modal>
  )
}
```

**Step 3: Type-check**

```bash
cd /Users/pelykh/Work/my-todos-web && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

Expected: no errors

**Step 4: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/components/LoginModal.tsx src/components/RegisterModal.tsx
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add LoginModal and RegisterModal"
```

---

### Task 11: SyncButton

**Files:**
- Create: `src/components/SyncButton.tsx`

**Step 1: Create `src/components/SyncButton.tsx`**

```tsx
import { ActionIcon, Tooltip } from '@mantine/core'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'

interface SyncButtonProps {
  onLoginRequest: () => void
}

export function SyncButton({ onLoginRequest }: SyncButtonProps) {
  const token = useAuthStore((s) => s.token)
  const { isSyncing, lastSyncedAt, error } = useSyncStore()

  if (!token) {
    return (
      <Tooltip label="Sync — click to sign in">
        <ActionIcon variant="default" size="lg" radius="md" onClick={onLoginRequest}>
          <Cloud size={18} style={{ opacity: 0.4 }} />
        </ActionIcon>
      </Tooltip>
    )
  }

  if (isSyncing) {
    return (
      <ActionIcon variant="default" size="lg" radius="md" disabled>
        <RefreshCw
          size={18}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </ActionIcon>
    )
  }

  if (error) {
    return (
      <Tooltip label={`Sync error: ${error}`} color="red">
        <ActionIcon variant="default" size="lg" radius="md" color="red">
          <CloudOff size={18} />
        </ActionIcon>
      </Tooltip>
    )
  }

  const label = lastSyncedAt
    ? `Synced at ${new Date(lastSyncedAt).toLocaleTimeString()}`
    : 'Synced'

  return (
    <Tooltip label={label}>
      <ActionIcon variant="default" size="lg" radius="md" color="green">
        <Cloud size={18} />
      </ActionIcon>
    </Tooltip>
  )
}
```

**Step 2: Type-check**

```bash
cd /Users/pelykh/Work/my-todos-web && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

Expected: no errors

**Step 3: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/components/SyncButton.tsx
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: add SyncButton with 4 states"
```

---

### Task 12: Update index.tsx toolbar

**Files:**
- Modify: `src/routes/index.tsx`

**Step 1: Update `src/routes/index.tsx`**

Replace the entire file with:

```tsx
import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CommandPalette } from '@/components/CommandPalette'
import { LoginModal } from '@/components/LoginModal'
import { OverflowMenu } from '@/components/OverflowMenu'
import { ProcessInboxButton } from '@/components/ProcessInboxButton'
import { RegisterModal } from '@/components/RegisterModal'
import { SettingsModal } from '@/components/SettingsModal'
import { SyncButton } from '@/components/SyncButton'
import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilters } from '@/store'
import { useGroupedFilteredTasks } from '@/store/taskStore'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { t } = useTranslation()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const filters = useFilters()
  const groups = useGroupedFilteredTasks({
    filters: {
      ...filters,
      status: 'next_action',
      isProject: false,
      excludeFutureScheduled: true,
    },
    groupBy: 'area',
    useImportant: true,
    sortBy: 'duration',
    sortOrder: 'desc',
  })

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <Group gap="xs" style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}>
        <ProcessInboxButton />
        <ActionIcon
          onClick={() => setCmdOpen(true)}
          variant="default"
          size="lg"
          radius="md"
          aria-label={t('cmdPlaceholder')}
        >
          <Search size={18} />
        </ActionIcon>
        <SyncButton onLoginRequest={() => setLoginOpen(true)} />
        <OverflowMenu onSettings={() => setSettingsOpen(true)} />
      </Group>

      <Container size="sm" py="xl" pb={120}>
        <Stack gap="lg">
          <Title order={2} ta="center">
            {t('pageTitle')}
          </Title>
          {Object.entries(groups).map(([area, tasks]) => {
            if (tasks.length === 0) return null
            return (
              <Stack key={area} gap={0}>
                <Text
                  size="xs"
                  fw={600}
                  tt="uppercase"
                  style={{
                    letterSpacing: '0.05em',
                    padding: '0 8px',
                    marginBottom: 2,
                    color:
                      area === 'important'
                        ? 'var(--mantine-color-orange-6)'
                        : 'var(--mantine-color-dimmed)',
                  }}
                >
                  {area === 'important'
                    ? t('groupImportant')
                    : t(`area.${area}`, { defaultValue: area })}
                </Text>
                {tasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    taskId={task.id}
                    status={area === 'important' ? 'important' : undefined}
                    displayMeta={['project', 'duration']}
                    href={`/task/${task.id}`}
                  />
                ))}
              </Stack>
            )
          })}
        </Stack>
      </Container>

      <Toolbar />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <LoginModal
        opened={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false)
          setRegisterOpen(true)
        }}
      />
      <RegisterModal
        opened={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false)
          setLoginOpen(true)
        }}
      />
      <SettingsModal opened={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
```

**Step 2: Type-check**

```bash
cd /Users/pelykh/Work/my-todos-web && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

Expected: no errors

**Step 3: Build check**

```bash
cd /Users/pelykh/Work/my-todos-web && npm run build 2>&1 | tail -20
```

Expected: build succeeds

**Step 4: Commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add src/routes/index.tsx
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: replace inline theme/lang with OverflowMenu + SyncButton"
```

---

### Task 13: Run all tests + dev smoke test

**Step 1: Run all unit tests**

```bash
cd /Users/pelykh/Work/my-todos-web && npx vitest run
```

Expected: all pass (case.test.ts, authStore.test.ts, ApiClient.test.ts)

**Step 2: Start the backend**

```bash
cd /Users/pelykh/Projects/my-todos && ./venv/bin/uvicorn main:app --reload &
```

**Step 3: Start the frontend dev server**

```bash
cd /Users/pelykh/Work/my-todos-web && npm run dev &
```

**Step 4: Manual smoke test checklist**

Open `http://localhost:5173` and verify:
- [ ] App loads and shows tasks as before (offline mode works)
- [ ] Top-right shows: ProcessInbox, Search, cloud icon (dim), ⋯ menu
- [ ] ⋯ menu opens with theme toggle, language selector, Settings item
- [ ] Theme toggle works from ⋯ menu
- [ ] Language switch works from ⋯ menu
- [ ] Settings → opens modal with API URL field → save changes apiUrl in store
- [ ] Cloud icon click → opens Login modal
- [ ] Login modal has "Register" link → switches to Register modal
- [ ] Register with new email → success → modal closes, cloud turns green
- [ ] Cloud shows synced time on hover
- [ ] Edit a task → 5 seconds later → cloud spins briefly

**Step 5: Final commit**

```bash
/usr/bin/git -C /Users/pelykh/Work/my-todos-web add -A
/usr/bin/git -C /Users/pelykh/Work/my-todos-web commit -m "feat: complete sync integration smoke-tested"
```
