import type { Payload } from 'payload'

import { CONTENT_KEYS, defaultContent, type Content } from './defaults'
import type { SiteLanguage } from './languages'

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isEmpty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0)

// Only the editable fields of a site-content document
export const pickContent = (doc: object | undefined) =>
  doc
    ? Object.fromEntries(CONTENT_KEYS.map((key) => [key, (doc as Record<string, unknown>)[key]]))
    : {}

// Remove document and array-row ids so a copy can be saved as a new document
const DROP = new Set(['id', 'createdAt', 'updatedAt', 'language'])
export function stripIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIds)
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !DROP.has(key))
        .map(([key, v]) => [key, stripIds(v)]),
    )
  }
  return value
}

// A translated value wins; an empty one falls back to the base value (per field, and per array item)
function merge(base: unknown, over: unknown): unknown {
  if (isEmpty(over)) return base

  if (Array.isArray(over)) {
    const baseItems = Array.isArray(base) ? base : []
    return over.map((item, i) => merge(baseItems[i], item))
  }
  if (isObject(over)) {
    const baseObj = isObject(base) ? base : {}
    const out: Record<string, unknown> = { ...baseObj }
    for (const [key, value] of Object.entries(over)) out[key] = merge(baseObj[key], value)
    return out
  }
  return over
}

// built-in text  <  default language's document  <  this language's document
export async function getSiteContent(
  payload: Payload,
  language: SiteLanguage,
  fallback: SiteLanguage,
): Promise<Content> {
  const ids = [language.id, fallback.id].filter((id): id is number => id !== null)

  const { docs } = ids.length
    ? await payload.find({
        collection: 'site-content',
        where: { language: { in: ids } },
        depth: 0,
        limit: ids.length,
      })
    : { docs: [] }

  const docFor = (id: number | null) => docs.find((d) => d.language === id)

  let content: unknown = merge(defaultContent, pickContent(docFor(fallback.id)))
  if (language.id !== fallback.id) content = merge(content, pickContent(docFor(language.id)))
  return content as Content
}
