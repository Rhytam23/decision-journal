import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-xs text-gold uppercase tracking-widest font-semibold mb-3">404</p>
        <h1 className="font-heading text-2xl font-bold text-ink-primary mb-2">
          Decision not found
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          This decision may have been deleted, or you don&apos;t have access to it.
        </p>
        <Link
          href="/"
          className="text-sm text-gold hover:text-gold-dim transition-colors underline underline-offset-2"
        >
          ← Back to journal
        </Link>
      </div>
    </div>
  )
}
