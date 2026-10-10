'use client'

import { homeFor } from '@/lib/homeFor'
import Link from 'next/link'
import { useState, type ChangeEvent } from 'react'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.errors?.[0]?.message ?? 'Invalid email or password.')
        setLoading(false)
        return
      }

      // Payload has set the payload-token cookie. /admin uses a different root
      // layout, so do a full navigation.
      const data = await res.json()
      console.log({ data })
      window.location.assign(homeFor(data.user?.role))
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <Link href="/" className="brand">
        <span className="brand-mark">S</span>
        SchoolHub
      </Link>
      <h1>Welcome back</h1>
      <p className="auth-sub">Sign in with the account your administrator created for you.</p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <Link href="/" className="back-link">
        ← Back to home
      </Link>
    </div>
  )
}
