import type { Payload } from 'payload'

import type { User } from '../../payload-types'
import type { TaskInput } from './schema'

// Every call runs as `user` with access rules enforced (overrideAccess: false)

export const createTask = (payload: Payload, user: User, input: TaskInput) =>
  payload.create({
    collection: 'tasks',
    // The collection hook also forces `student`; it's here to satisfy the type
    data: { ...input, student: user.id },
    user,
    overrideAccess: false,
  })

export const updateTask = (payload: Payload, user: User, id: number, input: TaskInput) =>
  payload.update({ collection: 'tasks', id, data: input, user, overrideAccess: false })

export const deleteTask = (payload: Payload, user: User, id: number) =>
  payload.delete({ collection: 'tasks', id, user, overrideAccess: false })
