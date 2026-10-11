import { Flag } from 'lucide-react'

import type { StudentTask } from '../lib/getStudentTasks'

export default function PriorityNotice({ tasks }: { tasks: StudentTask[] }) {
  const priorityOpen = tasks.filter((t) => t.isPriority && t.status !== 'completed')
  if (priorityOpen.length === 0) return null

  const extra = priorityOpen.length - 3

  return (
    <section className="notice" role="status">
      <Flag className="notice__icon" aria-hidden />
      <div>
        <strong>
          You have {priorityOpen.length} priority {priorityOpen.length === 1 ? 'task' : 'tasks'}
        </strong>
        <ul className="notice__chips">
          {priorityOpen.slice(0, 3).map((t) => (
            <li key={t.id}>{t.title}</li>
          ))}
          {extra > 0 && <li>+{extra} more</li>}
        </ul>
      </div>
    </section>
  )
}
