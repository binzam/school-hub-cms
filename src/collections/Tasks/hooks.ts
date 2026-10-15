import { revalidatePublicPages } from '@/hooks/revalidatePublicPages'
import { Task } from '@/payload-types'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeValidateHook } from 'payload'

// A student's task always belongs to that student, whatever the client sends
export const setStudentOnCreate: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation === 'create' && req.user?.role === 'student') {
    return { ...data, student: req.user.id }
  }
  return data
}
// Only tasks shown on the landing page matter (including one just un-flagged)
export const revalidateLandingTasks: CollectionAfterChangeHook<Task> = ({ doc, previousDoc, context }) => {
  if (doc.showOnLanding || previousDoc?.showOnLanding) revalidatePublicPages(context)
  return doc
}

export const revalidateLandingTasksOnDelete: CollectionAfterDeleteHook<Task> = ({ doc, context }) => {
  if (doc.showOnLanding) revalidatePublicPages(context)
  return doc
}