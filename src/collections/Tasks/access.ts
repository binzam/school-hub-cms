import { hasRole, rolesOrOwner } from '@/access'

const staffOrOwn = rolesOrOwner({
  all: ['super-admin', 'teacher'],
  owner: ['student'],
  ownerField: 'student',
})

export const taskAccess = {
  read: staffOrOwn,
  update: staffOrOwn, // teachers are limited to status/priority by field access
  create: hasRole('student', 'super-admin'),
  delete: rolesOrOwner({ all: ['super-admin'], owner: ['student'], ownerField: 'student' }),
}
