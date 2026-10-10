import type { Access, CollectionConfig, Where } from 'payload'
import { isSuperAdmin, isSuperAdminField } from '../access'

const readUsers: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin') return true

  if (user.role === 'teacher') {
    // teachers see themselves + students
    const where: Where = {
      or: [{ id: { equals: user.id } }, { role: { equals: 'student' } }],
    }
    return where
  }

  const own: Where = { id: { equals: user.id } } // students: only themselves
  return own
}

const updateUsers: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin') return true
  return { id: { equals: user.id } } // everyone else: only their own profile
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role'],
    // only super admins see the "Users" menu item
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  auth: true,
  access: {
    create: isSuperAdmin,
    read: readUsers,
    update: updateUsers,
    delete: isSuperAdmin,
    // to block students from the admin entirely
    // admin: ({ req: { user } }) => user?.role !== 'student',
  },
  hooks: {
    beforeValidate: [
      // The very first account ever created becomes the super admin
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) return { ...data, role: 'super-admin' }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      saveToJWT: true, // puts role in the login token so access checks are fast
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Teacher', value: 'teacher' },
        { label: 'Student', value: 'student' },
      ],
      // Nobody can promote themselves; only a super admin can set/change roles
      access: {
        create: isSuperAdminField,
        update: isSuperAdminField,
      },
    },
  ],
}
