import type { Payload } from 'payload'

import type { Media } from '../payload-types'
import type { SiteLanguage } from './content/languages'
import { idOf } from './idOf'

export type PostLink = { id: number; slug: string; lang: string; root: number; updatedAt: string }

export const postPath = (l: { lang: string; slug: string }) =>
  `/${l.lang}/news/${encodeURIComponent(l.slug)}`

// Next may hand dynamic params over percent-encoded for non-Latin slugs
export const decodeSlug = (slug: string) => {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export const mediaOf = (value: unknown): Media | null =>
  value && typeof value === 'object' ? (value as Media) : null

export function imageFor(media: Media | null, size: 'card' | 'og') {
  if (!media) return null
  const s = media.sizes?.[size]
  const url = s?.url ?? media.url
  const width = s?.width ?? media.width
  const height = s?.height ?? media.height
  return url && width && height ? { url, width, height, alt: media.alt } : null
}

// Every published, indexable post in an enabled language, with its translation group (root)
export async function getPostLinks(
  payload: Payload,
  languages: SiteLanguage[],
): Promise<PostLink[]> {
  const { docs } = await payload.find({
    collection: 'posts',
    where: { 'seo.noindex': { not_equals: true } },
    select: { slug: true, language: true, translationOf: true, updatedAt: true },
    depth: 0,
    pagination: false,
    overrideAccess: false, // anonymous: published posts only
  })

  const codeById = new Map(
    languages.flatMap((l) => (l.id === null ? [] : [[l.id, l.code] as const])),
  )

  return docs.flatMap((d) => {
    const lang = codeById.get(idOf(d.language) as number)
    if (!lang) return [] // language disabled or deleted
    return [
      {
        id: d.id,
        slug: d.slug,
        lang,
        root: (idOf(d.translationOf) as number | null) ?? d.id,
        updatedAt: d.updatedAt,
      },
    ]
  })
}

export async function getPosts(payload: Payload, language: SiteLanguage, limit = 24) {
  if (language.id === null) return []
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [{ language: { equals: language.id } }, { 'seo.noindex': { not_equals: true } }],
    },
    select: { title: true, slug: true, excerpt: true, cover: true, publishedAt: true },
    sort: '-publishedAt',
    limit,
    depth: 1,
    overrideAccess: false,
  })
  return docs
}

export async function getPost(payload: Payload, language: SiteLanguage, slug: string) {
  if (language.id === null) return null
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ language: { equals: language.id } }, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
}
