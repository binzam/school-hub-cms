import type { Access, PayloadRequest, Where } from 'payload'
import type { Role } from './roles'

type Args = { req: PayloadRequest }

// Works as BOTH an Access and a FieldAccess, because it only needs `req`
export const hasRole =
  (...roles: Role[]) =>
  ({ req: { user } }: Args) =>
    !!user && roles.includes(user.role)

export const isSuperAdmin = hasRole('super-admin')
export const canReview = hasRole('teacher', 'super-admin')
export const notTeacher = ({ req: { user } }: Args) => user?.role !== 'teacher'

export const anyone: Access = () => true
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Pattern that repeats across collections:
//   `all` roles: every document, `owner` roles: only their own, everyone else: nothing
export const rolesOrOwner =
  ({ all, owner, ownerField }: { all: Role[]; owner: Role[]; ownerField: string }): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    if (all.includes(user.role)) return true
    if (owner.includes(user.role)) {
      const where: Where = { [ownerField]: { equals: user.id } }
      return where
    }
    return false
  }
