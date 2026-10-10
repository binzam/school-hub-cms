import { CircleCheck, Flag } from 'lucide-react'

import type { StudentTask } from '../lib/getStudentTasks'
import TasksChart from './TasksChart'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function StudentOverview({ tasks }: { tasks: StudentTask[] }) {
  const completed = tasks.filter((t) => t.status === 'completed')
  const priorityOpen = tasks.filter((t) => t.isPriority && t.status !== 'completed')
  const extra = priorityOpen.length - 3

  return (
    <>
      {priorityOpen.length > 0 && (
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
      )}

      <section className="panel">
        <TasksChart createdAt={tasks.map((t) => t.createdAt)} />
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">
            Completed <span className="panel__count">{completed.length}</span>
          </h2>
        </div>

        {completed.length === 0 ? (
          <p className="empty">Nothing completed yet. Your teacher marks tasks as completed.</p>
        ) : (
          <ul className="bars">
            {completed.map((t) => (
              <li key={t.id} className="bar">
                <CircleCheck className="bar__icon" aria-hidden />
                <div className="bar__main">
                  <div className="bar__title">{t.title}</div>
                  <div className="bar__meta">Created {formatDate(t.createdAt)}</div>
                </div>
                {t.isPriority && <span className="badge badge-priority">Priority</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
