import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import { getLanguages } from './languages'

export const getRequestLanguages = cache(async () => {
  const payload = await getPayload({ config: await config })
  return { payload, languages: await getLanguages(payload) }
})