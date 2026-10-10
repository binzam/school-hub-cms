import type { CollectionSlug, ServerProps, Where } from 'payload'

type Props = ServerProps & {
  title?: string
  collection?: CollectionSlug
  doneWhere?: Where
}

export async function TaskCompletionChart({
  payload,
  user,
  title = 'Task completion rate',
  collection = 'tasks',
  doneWhere = { status: { equals: 'completed' } },
}: Props) {
  // Only staff see this. Students can't read `status`, so the query wouldn't work for them.
  if (user?.role !== 'super-admin' && user?.role !== 'teacher') return null

  const [{ totalDocs: total }, { totalDocs: done }] = await Promise.all([
    payload.count({ collection, user, overrideAccess: false }),
    payload.count({ collection, user, overrideAccess: false, where: doneWhere }),
  ])

  const ratio = total === 0 ? 0 : done / total
  const rate = Math.round(ratio * 100)
  const remaining = total - done
  const radius = 52
  const circumference = 2 * Math.PI * radius
  return (
    <section className="task-chart">
      <svg
        viewBox="0 0 120 120"
        className="task-chart__ring"
        role="img"
        aria-label={`${rate}% of tasks completed`}
      >
        <circle cx="60" cy="60" r={radius} className="task-chart__track" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="task-chart__progress"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="67" textAnchor="middle" className="task-chart__label">
          {rate}%
        </text>
      </svg>

      <div>
        <h3 className="task-chart__title">{title}</h3>
        <ul className="task-chart__legend">
          <li>
            <span className="dot dot--done" /> Completed: <strong>{done}</strong>
          </li>
          <li>
            <span className="dot dot--pending" /> Pending: <strong>{remaining}</strong>
          </li>
          <li>
            Total: <strong>{total}</strong>
          </li>
        </ul>
      </div>
    </section>
  )
}
