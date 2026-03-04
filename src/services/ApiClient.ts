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
