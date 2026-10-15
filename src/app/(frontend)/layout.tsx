import React from 'react'

import SiteDocument from '@/components/SiteDocument'
import { siteMetadata } from '@/lib/siteMetadata'

export const metadata = siteMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="en">{children}</SiteDocument>
}
