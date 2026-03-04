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
