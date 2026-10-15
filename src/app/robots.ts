import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/lib/getServerSideURL'

export default function robots(): MetadataRoute.Robots {
  const url = getServerSideURL()

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },

      // third-party SEO tool crawlers (no effect on rankings, only server load)
      { userAgent: ['SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot'], disallow: '/' },
    ],
    sitemap: `${url}/sitemap.xml`,
  }
}
