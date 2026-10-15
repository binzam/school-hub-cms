import type { Metadata } from 'next'

export const siteMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
  title: 'SchoolHub',
  description: 'Simple task management for teachers and students.',
  other: {
    google: 'notranslate',
  },
}
