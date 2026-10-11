import type { CollectionConfig } from 'payload'
import { canReview, isSuperAdmin, notTeacher } from '@/access'
import { taskAccess } from './access'
import { setStudentOnCreate } from './hooks'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'student', 'status', 'isPriority'] },
  access: taskAccess,
  hooks: { beforeValidate: [setStudentOnCreate] },
  fields: [
    { name: 'title', type: 'text', required: true, access: { update: notTeacher } },
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
      access: { update: isSuperAdmin },
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
      access: { create: isSuperAdmin, update: canReview },
    },
    {
      name: 'isPriority',
      label: 'Priority task',
      type: 'checkbox',
      defaultValue: false,
      access: { create: isSuperAdmin, update: canReview },
    },
    {
      name: 'showOnLanding',
      label: 'Show on public landing page',
      type: 'checkbox',
      defaultValue: false,
      access: { create: isSuperAdmin, update: isSuperAdmin },
      admin: {
        position: 'sidebar',
        description: 'Makes this task’s title and description publicly visible on the home page.',
      },
    },
  ],
}
