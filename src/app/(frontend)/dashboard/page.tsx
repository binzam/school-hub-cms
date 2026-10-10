import { Plus } from 'lucide-react'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import StudentOverview from '@/components/StudentOverview'
import { getStudentTasks } from '@/lib/getStudentTasks'
import config from '@/payload.config'
import LogoutButton from '../LogoutButton'
import ThemeToggle from '../ThemeToggle'

export const metadata = { title: 'My tasks · SchoolHub' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) redirect('/login')
  if (user.role !== 'student') redirect('/admin')

  const tasks = await getStudentTasks(payload, user)

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link href="/" className="brand">
            <span className="brand-mark">S</span>
            SchoolHub
          </Link>
          <div className="nav-actions">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container dash">
        <div className="dash__intro">
          <div>
            <h1>My tasks</h1>
            <p>{user.email}</p>
          </div>
          <div className="nav-actions">
            <Link href="/admin/collections/tasks" className="btn btn-ghost">
              All tasks
            </Link>
            <Link href="/admin/collections/tasks/create" className="btn btn-primary">
              <Plus size={16} aria-hidden /> New task
            </Link>
          </div>
        </div>

        <StudentOverview tasks={tasks} />
      </main>
    </>
  )
}
