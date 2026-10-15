import { notFound } from 'next/navigation'
import { cache } from 'react'

import { defaultLanguage } from './languages'
import { getRequestLanguages } from './request'
import { getSiteContent } from './siteContent'

export const loadLocalized = cache(async (code: string) => {
  const { payload, languages } = await getRequestLanguages()
  const language = languages.find((l) => l.code === code)
  if (!language) notFound() // unknown, disabled or deleted language

  const content = await getSiteContent(payload, language, defaultLanguage(languages))
  return { payload, languages, language, content }
})