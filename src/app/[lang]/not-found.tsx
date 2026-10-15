import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <h1>Page not found</h1>
        <p className="auth-sub">This page doesn&apos;t exist, or the language was removed.</p>
        <Link href="/" className="btn btn-primary">
          Go to the home page
        </Link>
      </div>
    </main>
  )
}
