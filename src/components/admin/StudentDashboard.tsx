import type { ServerProps } from 'payload'

import { getStudentTasks } from '../../lib/getStudentTasks'
import StudentOverview from '../StudentOverview'

export async function StudentDashboard({ payload, user }: ServerProps) {
  if (user?.role !== 'student') return null // staff see their own chart instead

  const tasks = await getStudentTasks(payload, user)

  return (
    <div className="dash-stack">
      <StudentOverview tasks={tasks} />
    </div>
  )
}
