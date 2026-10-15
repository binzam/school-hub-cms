import Link from 'next/link'

import AuthLink from '@/components/AuthLink'
import ThemeToggle from '@/components/ThemeToggle'
import type { Content } from '@/lib/content/defaults'
import type { SiteLanguage } from '@/lib/content/languages'
import LanguageSwitcher from './LanguageSwitcher'

export default function SiteHeader({
  language,
  languages,
  content,
  hrefFor,
}: {
  language: SiteLanguage
  languages: SiteLanguage[]
  content: Content
  hrefFor?: (code: string) => string // where the switcher sends each language
}) {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link href={`/${language.code}`} className="brand">
          <span className="brand-mark">S</span>
          SchoolHub
        </Link>
        <nav className="nav-actions">
          <Link href={`/${language.code}/news`} className="nav-link">
            {content.news.heading}
          </Link>
          <LanguageSwitcher languages={languages} current={language.code} hrefFor={hrefFor} />
          <ThemeToggle />
          <AuthLink
            signedOutLabel={content.nav.signIn}
            signedInLabel={content.nav.openDashboard}
            className="btn btn-primary"
            showLogout
          />
        </nav>
      </div>
    </header>
  )
}
