import React from 'react'

import SiteDocument from '@/components/SiteDocument'
import { getRequestLanguages } from '@/lib/content/request'
import { siteMetadata } from '@/lib/siteMetadata'

export const metadata = siteMetadata

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const { languages } = await getRequestLanguages()
  const language = languages.find((l) => l.code === lang)

  // An unknown language still gets a valid document; the page itself calls notFound(),
  // which keeps the 404 inside this layout instead of Next's bare default page
  return (
    <SiteDocument lang={language?.code ?? lang} dir={language?.direction ?? 'ltr'}>
      {children}
    </SiteDocument>
  )
}
