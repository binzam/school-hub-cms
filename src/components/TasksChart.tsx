'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Range = 'days' | 'months'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// false on the server, true after hydration (no effect + setState needed)
const subscribe = () => () => {}
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

// Buckets are computed in the browser so "which day" uses the student's own timezone
function buildSeries(range: Range, createdAt: string[]) {
  const now = new Date()
  const dates = createdAt.map((iso) => new Date(iso))

  if (range === 'days') {
    // Monday 00:00 of the current week, in local time
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    const rows = DAY_LABELS.map((label) => ({ label, count: 0 }))
    for (const d of dates) {
      if (d >= start && d < end) rows[(d.getDay() + 6) % 7].count++
    }
    return { rows, current: (now.getDay() + 6) % 7, subtitle: 'This week' }
  }

  const rows = MONTH_LABELS.map((label) => ({ label, count: 0 }))
  for (const d of dates) {
    if (d.getFullYear() === now.getFullYear()) rows[d.getMonth()].count++
  }
  return { rows, current: now.getMonth(), subtitle: String(now.getFullYear()) }
}

export default function TasksChart({ createdAt }: { createdAt: string[] }) {
  const [range, setRange] = useState<Range>('days')
  const mounted = useMounted()

  const series = useMemo(
    () => (mounted ? buildSeries(range, createdAt) : null),
    [mounted, range, createdAt],
  )

  const total = series ? series.rows.reduce((sum, r) => sum + r.count, 0) : 0
  const top = series ? Math.max(3, ...series.rows.map((r) => r.count)) : 3

  return (
    <>
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Tasks created</h2>
          <p className="panel__sub">
            {series ? `${series.subtitle} · ${total} ${total === 1 ? 'task' : 'tasks'}` : '\u00a0'}
          </p>
        </div>

        <div className="segmented" role="group" aria-label="Chart range">
          {(['days', 'months'] as const).map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
              {r === 'days' ? 'Days' : 'Months'}
            </button>
          ))}
        </div>
      </div>

      {series ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={series.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--sh-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--sh-muted)', fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, top]}
              width={32}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--sh-muted)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--sh-surface-2)' }}
              contentStyle={{
                background: 'var(--sh-surface)',
                border: '1px solid var(--sh-border)',
                borderRadius: 10,
                color: 'var(--sh-text)',
              }}
              labelStyle={{ color: 'var(--sh-muted)' }}
            />
            <Bar
              dataKey="count"
              name="Tasks"
              fill="var(--sh-accent)"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            >
              {series.rows.map((row, i) => (
                <Cell key={row.label} fillOpacity={i === series.current ? 1 : 0.45} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-skeleton" />
      )}
    </>
  )
}
