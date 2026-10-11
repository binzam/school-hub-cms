import type { CollectionBeforeValidateHook } from 'payload'

// The very first account ever created becomes the super admin
export const makeFirstUserSuperAdmin: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === 'create') {
    const { totalDocs } = await req.payload.count({ collection: 'users', req })
    if (totalDocs === 0) return { ...data, role: 'super-admin' }
  }
  return data
}
