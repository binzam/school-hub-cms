import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import PriorityNotice from '@/components/PriorityNotice'
import TasksChart from '@/components/TasksChart'
import { getStudentTasks } from '@/lib/getStudentTasks'
import config from '@/payload.config'
import LogoutButton from '@/components/LogoutButton'
import ThemeToggle from '@/components/ThemeToggle'
import TaskBoard from './TaskBoard'

export const metadata = { title: 'My tasks · SchoolHub', robots: { index: false, follow: false } }
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
        </div>

        <PriorityNotice tasks={tasks} />

        <TaskBoard tasks={tasks} />

        <section className="panel">
          <TasksChart createdAt={tasks.map((t) => t.createdAt)} />
        </section>
      </main>
    </>
  )
}
