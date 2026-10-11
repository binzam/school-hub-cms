import type { CollectionConfig } from 'payload'
import { mediaAccess } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: mediaAccess,
  fields: [{ name: 'alt', type: 'text', required: true }],
  upload: true,
}
