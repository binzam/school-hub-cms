'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { homeFor } from '@/lib/homeFor'
import LogoutButton from './LogoutButton'

type Props = {
  signedOutLabel: string
  signedInLabel: string
  className?: string
  showLogout?: boolean
}

export default function AuthLink({ signedOutLabel, signedInLabel, className, showLogout }: Props) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setRole(data?.user?.role ?? null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Link href={role ? homeFor(role) : '/login'} className={className}>
        {role ? signedInLabel : signedOutLabel}
      </Link>
      {role && showLogout && <LogoutButton onLoggedOut={() => setRole(null)} />}
    </>
  )
}
