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
