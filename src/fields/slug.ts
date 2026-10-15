import type { Field } from 'payload'

// Keeps letters and digits from any script, so Amharic or Arabic titles still get a slug
export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
  admin: {
    position: 'sidebar',
    description:
      'The page address, generated from the title. Fix it before publishing: changing it later breaks existing links.',
  },
  hooks: {
    beforeValidate: [({ value, data }) => slugify(String(value || data?.[from] || ''))],
  },
})
