import type { Access, FieldAccess } from 'payload'

export const isSuperAdmin: Access = ({ req: { user } }) => user?.role === 'super-admin'

export const isSuperAdminField: FieldAccess = ({ req: { user } }) => user?.role === 'super-admin'

// Teacher or super admin
export const canReview: FieldAccess = ({ req: { user } }) =>
  user?.role === 'teacher' || user?.role === 'super-admin'

// Everyone except teachers (students + super admin)
export const notTeacher: FieldAccess = ({ req: { user } }) => user?.role !== 'teacher'
