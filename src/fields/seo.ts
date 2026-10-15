import type { Field } from 'payload'

// Reusable SEO group for any public collection
export const seoFields: Field = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      maxLength: 70,
      admin: {
        description: 'Shown in search results. Empty = the title. Aim for under 60 characters.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description:
          'Shown under the title in search results. Empty = the excerpt. Aim for 120 to 160 characters.',
      },
    },
    {
      name: 'ogImage',
      label: 'Share image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used when the page is shared. Empty = the cover image.' },
    },
    { name: 'noindex', label: 'Hide from search engines', type: 'checkbox', defaultValue: false },
  ],
}
