import type { Access, CollectionConfig, Where } from 'payload'

import { isSuperAdmin } from '@/access'

// The public sees published posts only; super admins also see drafts
const readPosts: Access = ({ req: { user } }) => {
  if (user?.role === 'super-admin') return true
  const published: Where = { _status: { equals: 'published' } }
  return published
}

export const postAccess: CollectionConfig['access'] = {
  read: readPosts,
  create: isSuperAdmin,
  update: isSuperAdmin,
  delete: isSuperAdmin,
  readVersions: isSuperAdmin,
}
