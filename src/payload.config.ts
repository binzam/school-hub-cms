import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tasks } from './collections/Tasks'
import { Languages } from './collections/Languages'
import { SiteContent } from './collections/SiteContent'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: [
        {
          path: '/components/admin/TaskCompletionChart',
          exportName: 'TaskCompletionChart',
          serverProps: {
            title: 'Task completion rate',
            collection: 'tasks',
            doneWhere: { status: { equals: 'completed' } },
          },
        },
        '/components/admin/StudentDashboard#StudentDashboard',
      ],
      actions: [
        '/components/admin/HeaderViewSite#HeaderViewSite',
        '/components/admin/HeaderThemeToggle#HeaderThemeToggle',
        '/components/admin/HeaderLogout#HeaderLogout',
      ],
      afterNavLinks: ['/components/admin/NavMyTasks#NavMyTasks'],
      logout: { Button: '/components/admin/HiddenLogout#HiddenLogout' },
      views: {
        myTasks: {
          Component: '/components/admin/MyTasksView#MyTasksView',
          path: '/my-tasks',
        },
      },
    },
  },
  collections: [Users, Media, Tasks, Languages, SiteContent],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
