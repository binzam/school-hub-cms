import type { CollectionConfig } from 'payload'

import { publicReadAdminWrite } from '../../access'
import { onePerLanguage, protectDefaultContent, setTitle } from './hooks'

export const SiteContent: CollectionConfig = {
  slug: 'site-content',
  labels: { singular: 'Site content', plural: 'Site content' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'language', 'updatedAt'],
    hidden: ({ user }) => user?.role !== 'super-admin',
    description: 'One document per language. Empty fields fall back to the default language.',
  },
  access: publicReadAdminWrite,
  hooks: {
    beforeValidate: [onePerLanguage],
    beforeChange: [setTitle],
    beforeDelete: [protectDefaultContent],
  },
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } },
    {
      name: 'language',
      type: 'relationship',
      relationTo: 'languages',
      required: true,
      index: true,
      access: { update: () => false },
      admin: {
        position: 'sidebar',
        description: 'Created automatically when you add a language.',
      },
    },
    {
      name: 'nav',
      label: 'Header',
      type: 'group',
      fields: [
        { name: 'signIn', label: 'Sign in button', type: 'text' },
        { name: 'openDashboard', label: 'Open dashboard button', type: 'text' },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'title', type: 'text' },
        {
          name: 'highlight',
          type: 'text',
          admin: { description: 'The underlined part at the end of the title.' },
        },
        { name: 'lead', label: 'Intro paragraph', type: 'textarea' },
        { name: 'primaryCta', label: 'Primary button', type: 'text' },
        { name: 'secondaryCta', label: 'Secondary button', type: 'text' },
        { name: 'note', type: 'text' },
      ],
    },
    {
      name: 'features',
      label: 'Feature cards',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'subheading', type: 'text' },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
          maxRows: 6,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'textarea', required: true },
            {
              name: 'icon',
              type: 'select',
              defaultValue: 'shield',
              options: [
                { label: 'Shield', value: 'shield' },
                { label: 'Checklist', value: 'check' },
                { label: 'Eye', value: 'eye' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'preview',
      label: 'Task preview section',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'subheading', type: 'text' },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          admin: { description: 'Use {year} for the current year.' },
        },
      ],
    },
  ],
}
