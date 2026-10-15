'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton({ onLoggedOut }: { onLoggedOut?: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    } finally {
      router.refresh()
      onLoggedOut?.()
      setLoading(false)
    }
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={onClick} disabled={loading}>
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
