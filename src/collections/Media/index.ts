import type { CollectionConfig } from 'payload'
import { mediaAccess } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: mediaAccess,
  fields: [{ name: 'alt', type: 'text', required: true }],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'card', width: 800 }, // list cards, height follows the image
      { name: 'og', width: 1200, height: 630, position: 'centre' }, // social sharing ratio
    ],
    adminThumbnail: 'card',
  },
}
