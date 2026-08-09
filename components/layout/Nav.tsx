'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const NAV_LINKS = [
  { href: '/',         label: 'Journal' },
  { href: '/insights', label: 'Insights' },
]

export function Nav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    await signOut(auth)
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-app-bg/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-7 h-7 rounded-lg border border-gold-border bg-gold-subtle
                        flex items-center justify-center text-gold text-xs font-heading font-bold
                        group-hover:bg-gold group-hover:text-app-bg transition-colors"
          >
            DJ
          </div>
          <span className="font-heading font-semibold text-sm text-ink-primary hidden sm:block tracking-tight">
            Decision <span className="text-gold font-serif italic font-normal">Journal</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-gold bg-gold-subtle'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-app-hover'
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/decisions/new">
            <Button size="sm" className="hidden sm:inline-flex">
              Record a decision
            </Button>
            {/* Mobile: icon only */}
            <Button size="sm" className="sm:hidden w-8 h-8 !p-0 rounded-lg" aria-label="Record a decision">
              +
            </Button>
          </Link>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-app-hover transition-colors text-xs"
            aria-label="Sign out"
            title="Sign out"
          >
            ↗
          </button>
        </div>

      </div>
    </header>
  )
}
