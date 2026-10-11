export const ROLES = ['super-admin', 'teacher', 'student'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  'super-admin': 'Super Admin',
  teacher: 'Teacher',
  student: 'Student',
}