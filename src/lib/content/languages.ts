import type { Payload } from 'payload'

export type SiteLanguage = {
  id: number | null // null only for the built-in fallback
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  isDefault: boolean
}

// Used until the admin creates the first language
export const fallbackLanguage: SiteLanguage = {
  id: null,
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  isDefault: true,
}

// Enabled languages, default first
export async function getLanguages(payload: Payload): Promise<SiteLanguage[]> {
  const { docs } = await payload.find({
    collection: 'languages',
    where: { enabled: { equals: true } },
    pagination: false,
    depth: 0,
  })
  if (docs.length === 0) return [fallbackLanguage]

  return docs
    .map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      nativeName: d.nativeName,
      direction: d.direction ?? ('ltr' as const),
      isDefault: Boolean(d.isDefault),
    }))
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name))
}

export const defaultLanguage = (languages: SiteLanguage[]) =>
  languages.find((l) => l.isDefault) ?? languages[0]

// Browsers list languages in order of preference: 'am-ET,am;q=0.9,en;q=0.8'
export function pickLanguage(acceptLanguage: string | null, languages: SiteLanguage[]) {
  if (!acceptLanguage) return null
  const tags = acceptLanguage.split(',').map((part) => part.split(';')[0].trim().toLowerCase())

  for (const tag of tags) {
    const match =
      languages.find((l) => l.code === tag) ?? languages.find((l) => l.code === tag.split('-')[0])
    if (match) return match
  }
  return null
}
