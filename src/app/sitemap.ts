import type { MetadataRoute } from 'next'

import { defaultLanguage } from '@/lib/content/languages'
import { getRequestLanguages } from '@/lib/content/request'
import { getServerSideURL } from '@/lib/getServerSideURL'
import { getPostLinks, postPath } from '@/lib/posts'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = getServerSideURL()
  const { payload, languages } = await getRequestLanguages() // enabled languages only
  const defaultCode = defaultLanguage(languages).code

  // A page that exists in every language lists all versions, including itself
  const everyLanguage = (suffix: string) => ({
    languages: {
      ...Object.fromEntries(languages.map((l) => [l.code, `${url}/${l.code}${suffix}`])),
      'x-default': `${url}/${defaultCode}${suffix}`,
    },
  })

  const landing = languages.map((l) => ({ url: `${url}/${l.code}`, alternates: everyLanguage('') }))
  const newsLists = languages.map((l) => ({
    url: `${url}/${l.code}/news`,
    alternates: everyLanguage('/news'),
  }))

  // Posts only list the languages they have actually been translated into
  const links = await getPostLinks(payload, languages)
  const posts = links.map((link) => {
    const group = links.filter((l) => l.root === link.root)
    const fallback = group.find((l) => l.lang === defaultCode)
    return {
      url: `${url}${postPath(link)}`,
      lastModified: link.updatedAt,
      alternates:
        group.length > 1
          ? {
              languages: {
                ...Object.fromEntries(group.map((g) => [g.lang, `${url}${postPath(g)}`])),
                ...(fallback ? { 'x-default': `${url}${postPath(fallback)}` } : {}),
              },
            }
          : undefined,
    }
  })

  return [...landing, ...newsLists, ...posts]
}
