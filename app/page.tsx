'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Nav }          from '@/components/layout/Nav'
import { DecisionCard } from '@/components/decisions/DecisionCard'
import { EmptyState }   from '@/components/ui/EmptyState'
import { Button }       from '@/components/ui/Button'
import { getDecisions } from '@/lib/decisions'
import { useAuth }      from '@/components/layout/AuthContext'
import type { Decision } from '@/lib/types'

export default function JournalPage() {
  const { user } = useAuth()
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    getDecisions().then(data => {
      if (active) {
        setDecisions(data)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [user])

  const today = new Date().toISOString().substring(0, 10)
  const overdue  = decisions.filter(d => d.status === 'active' && (d.expectedOutcomeDate ?? '9999') < today)
  const active   = decisions.filter(d => d.status === 'active' && (d.expectedOutcomeDate ?? '9999') >= today)
  const resolved = decisions.filter(d => d.status === 'resolved')

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg">
        <Nav />
        <div className="max-w-5xl mx-auto px-4 py-32 flex justify-center">
          <span className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Nav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">

        {/* Welcome / empty state */}
        {decisions.length === 0 && (
          <div className="mt-16 animate-fade-in">
            <EmptyState
              title="Your journal is empty"
              description="Record your first decision. Write down what you predict will happen — before reality changes your memory of what you believed."
              action={
                <Link href="/decisions/new">
                  <Button size="lg">Record a decision</Button>
                </Link>
              }
              icon={<span className="font-serif text-6xl italic text-ink-muted/20">DJ</span>}
            />
          </div>
        )}

        {/* Awaiting review */}
        {overdue.length > 0 && (
          <section aria-labelledby="overdue-heading" className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="overdue-heading" className="font-heading text-base font-semibold text-ink-primary">
                  Awaiting review
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  These outcomes should be ready to evaluate.
                </p>
              </div>
              <span className="text-xs font-bold text-signal-yellow border border-signal-yellow/30 bg-signal-yellow/8 px-2.5 py-1 rounded-full">
                {overdue.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdue.map(d => <DecisionCard key={d.id} decision={d} />)}
            </div>
          </section>
        )}

        {/* Active decisions */}
        {active.length > 0 && (
          <section aria-labelledby="active-heading" className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="active-heading" className="font-heading text-base font-semibold text-ink-primary">
                  Active decisions
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Predictions committed. Waiting for the outcome.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.map(d => <DecisionCard key={d.id} decision={d} />)}
            </div>
          </section>
        )}

        {/* Resolved decisions */}
        {resolved.length > 0 && (
          <section aria-labelledby="resolved-heading" className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="resolved-heading" className="font-heading text-base font-semibold text-ink-primary">
                  Reviewed
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Prediction met reality.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolved.map(d => <DecisionCard key={d.id} decision={d} />)}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
