import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { defaultLanguage } from '@/lib/content/languages'
import { loadLocalized } from '@/lib/content/loadLocalized'
import { formatDate } from '@/lib/formatDate'
import { getPosts, imageFor, mediaOf } from '@/lib/posts'
import SiteFooter from '../SiteFooter'
import SiteHeader from '../SiteHeader'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { payload, languages, language, content } = await loadLocalized(lang)
  const posts = await getPosts(payload, language)
  const title = `${content.news.heading} · SchoolHub`

  return {
    title,
    description: content.news.subheading,
    alternates: {
      canonical: `/${language.code}/news`,
      languages: {
        ...Object.fromEntries(languages.map((l) => [l.code, `/${l.code}/news`])),
        'x-default': `/${defaultLanguage(languages).code}/news`,
      },
    },
    // an empty list is a thin page: keep it out of the index until there is something on it
    robots: posts.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      title,
      description: content.news.subheading,
      url: `/${language.code}/news`,
      locale: language.code,
      siteName: 'SchoolHub',
    },
  }
}

export default async function NewsPage({ params }: Props) {
  const { lang } = await params
  const { payload, languages, language, content } = await loadLocalized(lang)
  const posts = await getPosts(payload, language)

  return (
    <>
      <SiteHeader language={language} languages={languages} content={content} />

      <main className="container section">
        <div className="section-head">
          <h1>{content.news.heading}</h1>
          <p>{content.news.subheading}</p>
        </div>

        {posts.length === 0 ? (
          <p className="empty">{content.news.empty}</p>
        ) : (
          <div className="grid-3">
            {posts.map((post, i) => {
              const cover = imageFor(mediaOf(post.cover), 'card')
              const href = `/${language.code}/news/${encodeURIComponent(post.slug)}`
              return (
                <article key={post.id} className="card post-card">
                  {cover && (
                    <Link href={href} tabIndex={-1} aria-hidden>
                      <Image
                        className="post-card__cover"
                        src={cover.url}
                        alt={cover.alt}
                        width={cover.width}
                        height={cover.height}
                        sizes="(min-width: 860px) 360px, 100vw"
                        priority={i < 3} // above the fold: protects Largest Contentful Paint
                      />
                    </Link>
                  )}
                  <h2 className="post-card__title">
                    <Link href={href}>{post.title}</Link>
                  </h2>
                  <p className="post-card__excerpt">{post.excerpt}</p>
                  {post.publishedAt && (
                    <time className="post-card__meta" dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt, language.code)}
                    </time>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>

      <SiteFooter language={language} content={content} />
    </>
  )
}
