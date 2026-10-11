import { CircleCheck } from 'lucide-react'
import type { StudentTask } from '../lib/getStudentTasks'
import PriorityNotice from './PriorityNotice'
import TasksChart from './TasksChart'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function StudentOverview({ tasks }: { tasks: StudentTask[] }) {
  const completed = tasks.filter((t) => t.status === 'completed')

  return (
    <>
      <PriorityNotice tasks={tasks} />

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
