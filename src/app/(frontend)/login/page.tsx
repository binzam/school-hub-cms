import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import LoginForm from './LoginForm'
import { homeFor } from '@/lib/homeFor'

export const metadata = { title: 'Sign in · SchoolHub' }
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const { auth } = await getPayload({ config: await config })
  const { user } = await auth({ headers: await getHeaders() })

  // Already signed in? Skip the form.
  if (user) redirect(homeFor(user.role))

  return (
    <main className="auth-wrap">
      <LoginForm />
    </main>
  )
}
