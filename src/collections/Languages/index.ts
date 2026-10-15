import type { CollectionConfig } from 'payload'

import { publicReadAdminWrite } from '@/access'
import { afterLanguageChange, beforeLanguageDelete, enforceLanguageRules } from './hooks'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidatePublicPages'

// paths the app already uses
const RESERVED = ['api']

export const Languages: CollectionConfig = {
  slug: 'languages',
  labels: { singular: 'Language', plural: 'Languages' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'enabled', 'isDefault'],
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: publicReadAdminWrite,
  hooks: {
    beforeValidate: [enforceLanguageRules],
    afterChange: [afterLanguageChange, revalidateAfterChange],
    beforeDelete: [beforeLanguageDelete],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'name',
      label: 'Name (in English)',
      type: 'text',
      required: true,
      admin: { description: 'e.g. Amharic' },
    },
    {
      name: 'nativeName',
      label: 'Name (in the language itself)',
      type: 'text',
      required: true,
      admin: { description: 'Shown in the language switcher, e.g. አማርኛ' },
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: { update: () => false }, // fixed after creation: it is part of the page URL
      admin: { description: 'Used in the URL: /am, /ar, /pt-br. Cannot be changed later.' },
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
        ],
      },
      validate: (value?: string | null) => {
        if (!value) return 'Code is required'
        if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(value))
          return 'Use a code like en, am, ar or pt-br'
        if (RESERVED.includes(value)) return 'This code is reserved'
        return true
      },
    },
    {
      name: 'direction',
      type: 'select',
      defaultValue: 'ltr',
      options: [
        { label: 'Left to right', value: 'ltr' },
        { label: 'Right to left (Arabic, Hebrew…)', value: 'rtl' },
      ],
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'New languages stay hidden until you tick this. Translate the content first. Disabled languages return 404 and are left out of the switcher, hreflang and sitemap.',
      },
    },
    {
      name: 'isDefault',
      label: 'Default language',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Fallback for untranslated text. Tick this on another language to move the default.',
      },
    },
  ],
}
