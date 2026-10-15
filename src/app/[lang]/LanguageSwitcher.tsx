import { Languages } from 'lucide-react'
import Link from 'next/link'

import type { SiteLanguage } from '@/lib/content/languages'

export default function LanguageSwitcher({
  languages,
  current,
  hrefFor = (code) => `/${code}`,
}: {
  languages: SiteLanguage[]
  current: string
  hrefFor?: (code: string) => string
}) {
  if (languages.length < 2) return null

  return (
    // key remounts it on language change, which closes the menu
    <details className="lang" key={current}>
      <summary className="icon-btn lang__trigger" aria-label="Change language">
        <Languages aria-hidden />
        {current.toUpperCase()}
      </summary>
      <ul className="lang__menu">
        {languages.map((l) => (
          <li key={l.code}>
            <Link
              href={hrefFor(l.code)}
              lang={l.code}
              hrefLang={l.code}
              aria-current={l.code === current ? 'true' : undefined}
            >
              {l.nativeName}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  )
}
