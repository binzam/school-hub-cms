import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../../access'
import { ROLE_LABELS, ROLES } from '@/access/roles'
import { userAccess } from './access'
import { makeFirstUserSuperAdmin } from './hooks'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role'],
    // only super admins see the "Users" menu item
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  auth: true,
  access: userAccess,
  hooks: { beforeValidate: [makeFirstUserSuperAdmin] },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      saveToJWT: true,
      options: ROLES.map((value) => ({ value, label: ROLE_LABELS[value] })),
      // Nobody can promote themselves; only a super admin can set/change roles
      access: { create: isSuperAdmin, update: isSuperAdmin },
    },
    {
      name: 'preferredLanguage',
      type: 'relationship',
      relationTo: 'languages',
      filterOptions: { enabled: { equals: true } },
      admin: {
        position: 'sidebar',
        description: 'Language of the website when you are signed in.',
      },
    },
  ],
}
