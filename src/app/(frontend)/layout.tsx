import { Inter, Newsreader } from 'next/font/google'
import { cookies } from 'next/headers'
import React from 'react'
import './styles.scss'

const body = Inter({ subsets: ['latin'], variable: '--sh-font-body', display: 'swap' })
const display = Newsreader({ subsets: ['latin'], variable: '--sh-font-display', display: 'swap' })

export const metadata = {
  title: 'SchoolHub',
  description: 'Simple task management for teachers and students.',
}
const THEME_COOKIE = 'payload-theme'
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(THEME_COOKIE)?.value
  const theme = saved === 'light' || saved === 'dark' ? saved : undefined

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${body.variable} ${display.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  )
}
