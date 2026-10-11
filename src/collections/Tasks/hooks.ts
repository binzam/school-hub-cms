import type { CollectionBeforeValidateHook } from 'payload'

// A student's task always belongs to that student, whatever the client sends
export const setStudentOnCreate: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation === 'create' && req.user?.role === 'student') {
    return { ...data, student: req.user.id }
  }
  return data
}