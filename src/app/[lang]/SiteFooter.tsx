import Link from 'next/link'

import type { Content } from '@/lib/content/defaults'
import type { SiteLanguage } from '@/lib/content/languages'

export default function SiteFooter({
  language,
  content,
}: {
  language: SiteLanguage
  content: Content
}) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Link href={`/${language.code}`} className="brand">
          <span className="brand-mark">S</span>
          SchoolHub
        </Link>
        <span>{content.footer.text.replace('{year}', String(new Date().getFullYear()))}</span>
      </div>
    </footer>
  )
}
