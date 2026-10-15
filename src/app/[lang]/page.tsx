import { Eye, ListChecks, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import AuthLink from '@/components/AuthLink'
import ThemeToggle from '@/components/ThemeToggle'
import { defaultLanguage } from '@/lib/content/languages'
import { getRequestLanguages } from '@/lib/content/request'
import { getSiteContent } from '@/lib/content/siteContent'
import LanguageSwitcher from './LanguageSwitcher'

// Pre-rendered and cached. Admin edits refresh it immediately through the revalidation
// hooks; this hourly refresh is only a safety net.
export const revalidate = 3600

const ICONS = { shield: ShieldCheck, check: ListChecks, eye: Eye } as const

type Props = { params: Promise<{ lang: string }> }

export async function generateStaticParams() {
  const { languages } = await getRequestLanguages()
  return languages.map((l) => ({ lang: l.code }))
}

const load = cache(async (code: string) => {
  const { payload, languages } = await getRequestLanguages()
  const language = languages.find((l) => l.code === code)
  if (!language) notFound() // unknown, disabled or deleted language

  const content = await getSiteContent(payload, language, defaultLanguage(languages))
  return { payload, languages, language, content }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { languages, language, content } = await load(lang)

  return {
    title: `${content.hero.title} ${content.hero.highlight}`.trim() + ' · SchoolHub',
    description: content.hero.lead,
    alternates: {
      canonical: `/${language.code}`,
      languages: {
        ...Object.fromEntries(languages.map((l) => [l.code, `/${l.code}`])),
        'x-default': `/${defaultLanguage(languages).code}`,
      },
    },
  }
}

export default async function LandingPage({ params }: Props) {
  const { lang } = await params
  const { payload, languages, language, content } = await load(lang)

  // Only tasks a super admin explicitly flagged, and only these fields
  const { docs: tasks } = await payload.find({
    collection: 'tasks',
    where: { showOnLanding: { equals: true } },
    select: { title: true, description: true, status: true, isPriority: true },
    depth: 0,
    limit: 3,
    sort: '-createdAt',
  })


  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link href={`/${language.code}`} className="brand">
            <span className="brand-mark">S</span>
            SchoolHub
          </Link>
          <div className="nav-actions">
            <LanguageSwitcher languages={languages} current={language.code} />
            <ThemeToggle />
            <AuthLink
              signedOutLabel={content.nav.signIn}
              signedInLabel={content.nav.openDashboard}
              className="btn btn-primary"
              showLogout
            />
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <span className="eyebrow">{content.hero.eyebrow}</span>
            <h1>
              {content.hero.title}{' '}
              {content.hero.highlight && <span className="accent-underline">{content.hero.highlight}</span>}
            </h1>
            <p className="lead">{content.hero.lead}</p>
            <div className="hero-actions">
              <AuthLink
                signedOutLabel={content.hero.primaryCta}
                signedInLabel={content.nav.openDashboard}
                className="btn btn-primary btn-lg"
              />
              <a href="#features" className="btn btn-ghost btn-lg">
                {content.hero.secondaryCta}
              </a>
            </div>
            <p className="hero-note">{content.hero.note}</p>
          </div>
        </section>

        <section id="features" className="section">
          <div className="container">
            <div className="section-head">
              <h2>{content.features.heading}</h2>
              <p>{content.features.subheading}</p>
            </div>
            <div className="grid-3">
              {content.features.items.map((item, i) => {
                const Icon = ICONS[item.icon] ?? ShieldCheck
                return (
                  <article key={i} className="card">
                    <div className="icon-wrap">
                      <Icon aria-hidden />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {tasks.length > 0 && (
          <section id="preview" className="section">
            <div className="container">
              <div className="section-head">
                <h2>{content.preview.heading}</h2>
                <p>{content.preview.subheading}</p>
              </div>
              <div className="grid-3">
                {tasks.map((task) => (
                  <article key={task.id} className="card task-card">
                    <h3>{task.title}</h3>
                    {task.description && <p className="task-desc">{task.description}</p>}
                    <div className="badges">
                      <span className={`badge badge-${task.status ?? 'pending'}`}>
                        {task.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                      {task.isPriority && <span className="badge badge-priority">Priority</span>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <Link href={`/${language.code}`} className="brand">
            <span className="brand-mark">S</span>
            SchoolHub
          </Link>
          <span>{content.footer.text.replace('{year}', String(new Date().getFullYear()))}</span>
        </div>
      </footer>
    </>
  )
}
