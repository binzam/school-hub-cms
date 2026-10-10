import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { getStudentTasks } from '../../lib/getStudentTasks'
import StudentOverview from '../StudentOverview'

export async function MyTasksView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult
  const { user, payload, i18n } = req

  if (!user) redirect('/admin/login')
  if (user.role !== 'student') redirect('/admin') // staff have their own dashboard

  // Same helper as the frontend page: runs with the student's own permissions
  const tasks = await getStudentTasks(payload, user)

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div className="my-tasks__head">
          <h1>My tasks</h1>
          <p>{user.email}</p>
        </div>

        <div className="dash-stack">
          <StudentOverview tasks={tasks} />
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
