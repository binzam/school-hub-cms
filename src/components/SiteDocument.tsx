import React from 'react'

import { fontVariables } from '@/lib/fonts'
import '../styles/site.scss'
import Script from 'next/script'

// Runs before first paint: applies the saved theme (the cookie is shared with the Payload
// admin). No cookie means the CSS falls back to the system preference.
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )payload-theme=(light|dark)/);if(m)document.documentElement.setAttribute('data-theme',m[1])}catch(e){}})()`

export default function SiteDocument({
  lang,
  dir = 'ltr',
  children,
}: {
  lang: string
  dir?: 'ltr' | 'rtl'
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning: the script sets data-theme before React hydrates
    <html lang={lang} dir={dir} translate="no" className={fontVariables} suppressHydrationWarning>
      <body>
        {/* A raw HTML string, not a React <script>: the browser runs it while parsing, and
            React never creates a script element on the client, so there's no warning */}
        {/* <div
          hidden
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: `<script>${themeScript}</script>` }}
        /> */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  )
}
