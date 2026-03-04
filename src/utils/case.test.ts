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
