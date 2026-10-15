import type { CollectionConfig } from 'payload'

import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { postAccess } from './access'
import {
  revalidatePosts,
  revalidatePostsOnDelete,
  setPublishedAt,
  uniqueSlugPerLanguage,
  validateTranslation,
} from './hooks'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'language', '_status', 'publishedAt'],
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: postAccess,
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: '-publishedAt',
  hooks: {
    beforeValidate: [uniqueSlugPerLanguage, validateTranslation],
    beforeChange: [setPublishedAt],
    afterChange: [revalidatePosts],
    afterDelete: [revalidatePostsOnDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'language',
      type: 'relationship',
      relationTo: 'languages',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'translationOf',
      label: 'Translation of',
      type: 'relationship',
      relationTo: 'posts',
      index: true,
      // only originals can be picked, never the post itself
      filterOptions: ({ id }) => ({
        translationOf: { exists: false },
        ...(id ? { id: { not_equals: id } } : {}),
      }),
      admin: {
        position: 'sidebar',
        description:
          'If this post translates another one, pick the original. Leave empty for an original.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: {
        description:
          'Summary shown in lists. Also the search description unless you set one under SEO.',
      },
    },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    seoFields,
  ],
}
