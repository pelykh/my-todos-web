# Sync Integration Design

**Date:** 2026-03-04

## Goal

Integrate the my-todos FastAPI backend into the React frontend. App stays fully usable offline without auth. Sync is opt-in, additive — a layer on top of the existing LocalStorage-first architecture.

---

## Architecture: Sync Layer Alongside LocalStorage (Option B)

`LocalStorageTaskService` remains the source of truth. No changes to `ITaskService` or `LocalStorageTaskService`. The sync layer is a pure side-effect: it observes taskStore changes and pushes/pulls from the server.

---

## Backend Changes

**`main.py`** — add `CORSMiddleware`:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

No other backend changes needed. SSE auth is handled via `@microsoft/fetch-event-source` which supports custom headers.

---

## New Frontend Files

```
src/
├── services/
│   ├── ApiClient.ts        # fetch wrapper: base URL, Bearer header, camelCase↔snake_case
│   └── SyncService.ts      # push / pull / SSE subscription
├── store/
│   ├── authStore.ts        # token, email, apiUrl — persisted to localStorage
│   └── syncStore.ts        # lastSyncVersion, isSyncing, lastSyncedAt, error
└── components/
    ├── OverflowMenu.tsx    # ⋯ menu: theme toggle, language select, Settings item
    ├── SettingsModal.tsx   # API URL input + Save
    ├── SyncButton.tsx      # cloud icon with 4 states
    ├── LoginModal.tsx      # email + password + link to RegisterModal
    └── RegisterModal.tsx   # email + password + link to LoginModal
```

---

## Modified Frontend Files

- `src/routes/index.tsx` — replace inline theme/lang buttons with `<OverflowMenu>` and `<SyncButton>`

---

## API Contract

Backend uses `snake_case`. Frontend uses `camelCase`. `ApiClient` converts both directions on every request/response.

| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/auth/login` | POST | `{ email, password }` | `{ access_token }` |
| `/auth/register` | POST | `{ email, password }` | `{ access_token }` |
| `/sync` | POST | `{ changes: Task[] }` (snake_case) | `{ server_version }` |
| `/sync?since=N` | GET | — | `{ tasks: Task[] }` (snake_case) |
| `/events` | GET (SSE) | — | `data: {"type":"change"\|"ping"}` |

---

## camelCase ↔ snake_case

`ApiClient` includes two utility functions:
- `toSnakeCase(obj)` — converts request bodies before sending
- `toCamelCase(obj)` — converts response bodies after receiving

Applied recursively to all task objects.

---

## Auth Store (`authStore.ts`)

```typescript
type AuthState = {
  token: string | null
  email: string | null
  apiUrl: string          // default: "http://localhost:8000"
  login: (email, password) => Promise<void>
  register: (email, password) => Promise<void>
  logout: () => void
  setApiUrl: (url: string) => void
}
```

Persisted to localStorage via Zustand `persist` middleware.

---

## Sync Store (`syncStore.ts`)

```typescript
type SyncState = {
  lastSyncVersion: number   // default: 0
  isSyncing: boolean
  lastSyncedAt: Date | null
  error: string | null
}
```

Persisted to localStorage (lastSyncVersion only).

---

## Sync Data Flow

```
User action
  → LocalStorageTaskService (instant, offline-safe)
  → taskStore.set()
  → syncSubscription (if logged in)
  → debounce 5s
  → ApiClient.pushSync(allLocalTasks)
  → syncStore.lastSyncVersion = returned server_version

SSE "change" event
  → ApiClient.pullSync(since=lastSyncVersion)
  → for each received task: upsert into localStorage + taskStore
    (including status="deleted" tasks — kept in storage, filtered by UI)
  → syncStore.lastSyncVersion = max received server_version
```

**Push strategy:** push ALL local tasks on every sync (simple, idempotent).

**Merge strategy on pull:** upsert all received tasks — never delete from localStorage. Tasks with `status="deleted"` are stored but invisible (UI filters don't request deleted status).

**Conflict resolution:** server version wins on pull (last-write-wins by server_version).

---

## Sync Lifecycle

**On login:**
1. Immediate push of all local tasks
2. Pull `since=0` to get any server-only tasks
3. Subscribe to SSE

**On logout:**
1. Disconnect SSE
2. Clear token (apiUrl and lastSyncVersion persist)

**On SSE disconnect / error:**
- Reconnect automatically (fetch-event-source handles this)

---

## UI Changes

### Top-right toolbar (`src/routes/index.tsx`)
```
[ProcessInbox] [Search] [SyncButton] [OverflowMenu ⋯]
```

### SyncButton states
| State | Icon | Behaviour |
|---|---|---|
| Not logged in | Cloud outline | Click → open LoginModal |
| Syncing | Spinner | — |
| Synced | Cloud solid | Hover → last synced time |
| Error | Cloud with X | Click → show error / retry |

### OverflowMenu (⋯)
- Theme toggle (Dark / Light)
- Language (EN / UK inline SegmentedControl)
- Settings → opens SettingsModal

### SettingsModal
- API URL text input (default `http://localhost:8000`)
- Save button (persists to authStore)

### LoginModal
- Email + password inputs
- Login button
- "Don't have an account? Register" → opens RegisterModal (closes LoginModal)
- Error message on failed login

### RegisterModal
- Email + password inputs (password min 8 chars)
- Register button
- "Already have an account? Login" → opens LoginModal (closes RegisterModal)
- Error message on failed registration

---

## Dependencies to Install

```bash
npm install @microsoft/fetch-event-source
```
