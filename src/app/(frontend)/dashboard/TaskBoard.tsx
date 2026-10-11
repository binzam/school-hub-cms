'use client'

import { Circle, CircleCheck, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

import type { StudentTask } from '@/lib/getStudentTasks'
import { deleteTaskAction } from '@/lib/tasks/actions'
import TaskDialog from './TaskDialog'

type Filter = 'all' | 'open' | 'completed'
type DialogState = { task: StudentTask | null } | null

// UTC so the server render and the browser render always agree
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

const isOpenPriority = (t: StudentTask) => t.isPriority && t.status !== 'completed'

export default function TaskBoard({ tasks }: { tasks: StudentTask[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [error, setError] = useState<string | null>(null)

  const counts = {
    all: tasks.length,
    open: tasks.filter((t) => t.status !== 'completed').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  const visible = tasks
    .filter((t) =>
      filter === 'all'
        ? true
        : filter === 'completed'
          ? t.status === 'completed'
          : t.status !== 'completed',
    )
    // open priority tasks float to the top (sort is stable, so the rest keep newest-first)
    .sort((a, b) => Number(isOpenPriority(b)) - Number(isOpenPriority(a)))

  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">
          Tasks <span className="panel__count">{counts.all}</span>
        </h2>

        <div className="panel__tools">
          <div className="segmented" role="group" aria-label="Filter tasks">
            {(['all', 'open', 'completed'] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Completed'} {counts[f]}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setDialog({ task: null })}
          >
            <Plus size={16} aria-hidden /> New task
          </button>
        </div>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="empty">
          {tasks.length === 0
            ? 'No tasks yet. Create your first one with the New task button.'
            : 'No tasks in this view.'}
        </p>
      ) : (
        <ul className="tasks">
          {visible.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onEdit={() => setDialog({ task })}
              onError={setError}
            />
          ))}
        </ul>
      )}

      {/* Mounted only while open, so the form starts fresh every time */}
      {dialog && (
        <TaskDialog
          key={dialog.task?.id ?? 'new'}
          task={dialog.task}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  )
}

function TaskRow({
  task,
  onEdit,
  onError,
}: {
  task: StudentTask
  onEdit: () => void
  onError: (message: string | null) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const done = task.status === 'completed'

  const remove = () => {
    onError(null)
    startTransition(async () => {
      const res = await deleteTaskAction(task.id)
      if (!res.ok) {
        onError(res.error)
        setConfirming(false)
      }
    })
  }

  return (
    <li
      className={['task', done && 'task--done', isOpenPriority(task) && 'task--priority']
        .filter(Boolean)
        .join(' ')}
    >
      <span className="task__status">
        {done ? <CircleCheck aria-label="Completed" /> : <Circle aria-label="Pending" />}
      </span>

      <div className="task__main">
        <div className="task__title">{task.title}</div>
        {task.description && <p className="task__desc">{task.description}</p>}
        <div className="task__meta">
          Created <time dateTime={task.createdAt}>{formatDate(task.createdAt)}</time>
        </div>
      </div>

      <div className="task__badges">
        {task.isPriority && <span className="badge badge-priority">Priority</span>}
        <span className={`badge badge-${task.status ?? 'pending'}`}>
          {done ? 'Completed' : 'Pending'}
        </span>
      </div>

      <div className="task__actions">
        {confirming ? (
          <>
            <span className="task__confirm">Delete this task?</span>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={remove}
              disabled={pending}
            >
              {pending ? 'Deleting…' : 'Delete'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="task__btn"
              onClick={onEdit}
              aria-label={`Edit ${task.title}`}
            >
              <Pencil />
            </button>
            <button
              type="button"
              className="task__btn task__btn--danger"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
