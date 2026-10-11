import type { Access, CollectionConfig, Where } from 'payload'
import { isSuperAdmin, rolesOrOwner } from '@/access'

// super admin: everyone. teachers: themselves + students. students: only themselves.
const readUsers: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin') return true

  const self: Where = { id: { equals: user.id } }
  if (user.role === 'teacher') {
    const where: Where = { or: [self, { role: { equals: 'student' } }] }
    return where
  }
  return self
}

export const userAccess: CollectionConfig['access'] = {
  create: isSuperAdmin,
  read: readUsers,
  // super admin edits anyone, everyone else only their own profile
  update: rolesOrOwner({ all: ['super-admin'], owner: ['teacher', 'student'], ownerField: 'id' }),
  delete: isSuperAdmin,
}