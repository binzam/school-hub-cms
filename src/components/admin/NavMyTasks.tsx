import { ListChecks } from 'lucide-react'
import type { ServerProps } from 'payload'

export function NavMyTasks({ user }: ServerProps) {
  if (user?.role !== 'student') return null

  return (
    <a href="/admin/my-tasks" className="nav-extra">
      <ListChecks aria-hidden /> My tasks
    </a>
  )
}