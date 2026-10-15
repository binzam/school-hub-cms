import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import JsonLd from '@/components/JsonLd'
import { defaultLanguage } from '@/lib/content/languages'
import { loadLocalized } from '@/lib/content/loadLocalized'
import { getRequestLanguages } from '@/lib/content/request'
import { formatDate } from '@/lib/formatDate'
import { getServerSideURL } from '@/lib/getServerSideURL'
import { decodeSlug, getPost, getPostLinks, imageFor, mediaOf, postPath } from '@/lib/posts'
import SiteFooter from '../../SiteFooter'
import SiteHeader from '../../SiteHeader'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  const { payload, languages } = await getRequestLanguages()
  const links = await getPostLinks(payload, languages)
  return links.map((l) => ({ lang: l.lang, slug: l.slug }))
}

const loadPost = cache(async (code: string, rawSlug: string) => {
  const ctx = await loadLocalized(code)
  const post = await getPost(ctx.payload, ctx.language, decodeSlug(rawSlug))
  if (!post) notFound() // unknown, unpublished or deleted

  // this post's translation group (empty for noindex posts, so no hreflang is emitted)
  const links = await getPostLinks(ctx.payload, ctx.languages)
  const self = links.find((l) => l.id === post.id)
  const siblings = self ? links.filter((l) => l.root === self.root) : []

  return { ...ctx, post, siblings }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const { languages, language, post, siblings } = await loadPost(lang, slug)

  const title = post.seo?.metaTitle || post.title
  const description = post.seo?.metaDescription || post.excerpt
  const path = postPath({ lang: language.code, slug: post.slug })
  const og = imageFor(mediaOf(post.seo?.ogImage) ?? mediaOf(post.cover), 'og')

  const xDefault = siblings.find((s) => s.lang === defaultLanguage(languages).code)

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages:
        siblings.length > 1
          ? {
              ...Object.fromEntries(siblings.map((s) => [s.lang, postPath(s)])),
              ...(xDefault ? { 'x-default': postPath(xDefault) } : {}),
            }
          : undefined,
    },
    robots: post.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      url: path,
      siteName: 'SchoolHub',
      locale: language.code,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: og ? [{ url: og.url, width: og.width, height: og.height, alt: og.alt }] : undefined,
    },
    twitter: {
      card: og ? 'summary_large_image' : 'summary',
      title,
      description,
      images: og ? [og.url] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { lang, slug } = await params
  const { languages, language, content, post, siblings } = await loadPost(lang, slug)

  const base = getServerSideURL()
  const path = postPath({ lang: language.code, slug: post.slug })
  const cover = imageFor(mediaOf(post.cover), 'card')
  const og = imageFor(mediaOf(post.seo?.ogImage) ?? mediaOf(post.cover), 'og')
  const description = post.seo?.metaDescription || post.excerpt
  const published = post.publishedAt ?? post.createdAt

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    image: og ? [`${base}${og.url}`] : undefined,
    datePublished: published,
    dateModified: post.updatedAt,
    inLanguage: language.code,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${base}${path}` },
    author: { '@type': 'Organization', name: 'SchoolHub', url: base },
    publisher: { '@type': 'Organization', name: 'SchoolHub', url: base },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: content.news.home,
        item: `${base}/${language.code}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: content.news.heading,
        item: `${base}/${language.code}/news`,
      },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${base}${path}` },
    ],
  }

  // The switcher jumps to this post's translation, or to that language's news list
  const hrefFor = (code: string) => {
    const match = siblings.find((s) => s.lang === code)
    return match ? postPath(match) : `/${code}/news`
  }

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      <SiteHeader language={language} languages={languages} content={content} hrefFor={hrefFor} />

      <main className="container article">
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href={`/${language.code}`}>{content.news.home}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${language.code}/news`}>{content.news.heading}</Link>
        </nav>

        <article>
          <header className="article__head">
            <h1>{post.title}</h1>
            <time className="article__meta" dateTime={published}>
              {formatDate(published, language.code)}
            </time>
          </header>

          {cover && (
            <Image
              className="article__cover"
              src={cover.url}
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              sizes="(min-width: 800px) 760px, 100vw"
              priority // the likely Largest Contentful Paint element
            />
          )}

          <div className="prose">
            <RichText data={post.content} />
          </div>
        </article>

        <Link href={`/${language.code}/news`} className="btn btn-ghost">
          ← {content.news.back}
        </Link>
      </main>

      <SiteFooter language={language} content={content} />
    </>
  )
}
