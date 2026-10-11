import type { Payload } from 'payload'

import type { User } from '../payload-types'

export async function getStudentTasks(payload: Payload, user: User) {
  const { docs } = await payload.find({
    collection: 'tasks',
    where: { student: { equals: user.id } },
    select: { title: true, description: true, status: true, isPriority: true, createdAt: true },
    depth: 0,
    pagination: false,
    sort: '-createdAt',
    user,
    overrideAccess: false,
  })
  return docs
}

export type StudentTask = Awaited<ReturnType<typeof getStudentTasks>>[number]
