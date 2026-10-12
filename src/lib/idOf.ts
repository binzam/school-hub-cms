// A relationship value can be an id or a populated document; this returns the id either way
export const idOf = (value: unknown): number | string | null => {
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: number | string }).id
  return typeof value === 'number' || typeof value === 'string' ? value : null
}