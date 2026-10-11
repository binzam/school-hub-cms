import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '@/access'

export const mediaAccess: CollectionConfig['access'] = {
  read: anyone, // files are public so the website can show them
  create: authenticated,
  update: authenticated,
  delete: authenticated,
}
