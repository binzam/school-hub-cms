import React from 'react'
import './styles.css'

export const metadata = {
  title: 'SchoolHub',
  description: 'Simple task management for teachers and students.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
