import type { Access, CollectionConfig, Where } from 'payload'
import { canReview, isSuperAdminField, notTeacher } from '../access'

// super admin + teachers: all tasks. students: only their own.
const readTasks: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin' || user.role === 'teacher') return true
  const own: Where = { student: { equals: user.id } }
  return own
}

const createTasks: Access = ({ req: { user } }) =>
  user?.role === 'student' || user?.role === 'super-admin'

// teachers can update (only status/priority, enforced per field below)
const updateTasks: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin' || user.role === 'teacher') return true
  return { student: { equals: user.id } }
}

// teachers can never delete
const deleteTasks: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'super-admin') return true
  if (user.role === 'student') return { student: { equals: user.id } }
  return false
}

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'student.name', 'status', 'isPriority'],
  },
  access: {
    create: createTasks,
    read: readTasks,
    update: updateTasks,
    delete: deleteTasks,
  },
  hooks: {
    beforeValidate: [
      // A student's task always belongs to that student, whatever the client sends
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user?.role === 'student') {
          return { ...data, student: req.user.id }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      access: { update: notTeacher }, // teachers can't edit
    },
    {
      name: 'description',
      type: 'textarea',
      access: { update: notTeacher }, // teachers can't edit
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: { role: { equals: 'student' } },
      access: { update: isSuperAdminField },
      admin: {
        // students don't pick an owner; the hook sets it
        condition: (_data, _siblingData, { user }) => user?.role !== 'student',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
      ],
      // students cant see but not change it
      access: { create: isSuperAdminField, update: canReview },
    },
    {
      name: 'isPriority',
      label: 'Priority task',
      type: 'checkbox',
      defaultValue: false,
      access: { create: isSuperAdminField, update: canReview },
    },
    {
      name: 'showOnLanding',
      label: 'Show on public landing page',
      type: 'checkbox',
      defaultValue: false,
      access: { create: isSuperAdminField, update: isSuperAdminField },
      admin: {
        position: 'sidebar',
        description: 'Makes this task’s title and description publicly visible on the home page.',
      },
    },
  ],
}
