import { redirect } from 'next/navigation'

import { defaultLanguage } from '@/lib/content/languages'
import { getRequestLanguages } from '@/lib/content/request'

export const revalidate = 3600 // refreshed immediately when the default changes (see the hooks)

export default async function RootRedirect() {
  const { languages } = await getRequestLanguages()
  redirect(`/${defaultLanguage(languages).code}`)
}
