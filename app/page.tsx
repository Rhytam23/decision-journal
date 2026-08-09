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

export default function Page() {
  const { user } = useAuth()
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
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
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── RENDER PUBLIC LANDING PAGE (Unauthenticated) ────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col justify-between">
        
        {/* Simple Header */}
        <header className="px-6 py-6 border-b border-border bg-app-bg/50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg border border-gold-border bg-gold-subtle flex items-center justify-center text-gold text-xs font-heading font-bold">
                DJ
              </div>
              <span className="font-heading font-semibold text-sm text-ink-primary tracking-tight">
                Decision <span className="text-gold font-serif italic font-normal">Journal</span>
              </span>
            </div>
            <Link href="/auth/login">
              <Button size="sm" variant="secondary">Sign in</Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center py-20 px-6 animate-fade-in">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
            
            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-ink-primary max-w-xl leading-tight mb-6">
              Get better at making decisions by checking your{' '}
              <span className="text-gold font-serif italic font-normal">predictions</span> against{' '}
              <span className="text-gold font-serif italic font-normal">reality</span>.
            </h1>
            
            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed max-w-md mb-12">
              Decision Journal is a serious personal decision-intelligence tool. 
              Commit your predictions before reality changes what you believed.
            </p>

            {/* Core Loop visualizer */}
            <div className="w-full border border-border bg-app-surface rounded-2xl p-6 sm:p-8 mb-12 text-left">
              <p className="text-[10px] text-gold font-semibold uppercase tracking-widest mb-6 text-center">
                The Decision-Intelligence Loop
              </p>
              
              <div className="grid grid-cols-5 gap-2 sm:gap-4 relative text-center">
                {[
                  { label: 'Decide',  desc: 'Choose option' },
                  { label: 'Predict', desc: 'State outcomes' },
                  { label: 'Wait',    desc: 'Let time pass' },
                  { label: 'Review',  desc: 'Record reality' },
                  { label: 'Learn',   desc: 'Expose bias' }
                ].map((step, idx) => (
                  <div key={step.label} className="flex flex-col items-center relative z-10">
                    <div className="w-8 h-8 rounded-full border border-gold/30 bg-gold-subtle text-gold font-heading text-xs font-semibold flex items-center justify-center mb-3">
                      0{idx + 1}
                    </div>
                    <p className="text-xs font-bold text-ink-primary mb-1 uppercase tracking-wide">
                      {step.label}
                    </p>
                    <p className="text-[10px] text-ink-muted leading-tight hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                ))}
                {/* Connecting Line */}
                <div className="absolute top-4 left-[10%] right-[10%] h-px bg-border z-0 hidden sm:block" />
              </div>
            </div>

            <Link href="/auth/login">
              <Button size="lg">Start your journal</Button>
            </Link>

          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="py-6 px-6 border-t border-border text-center text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} Decision Journal. Built for personal calibration.</p>
        </footer>

      </div>
    )
  }

  // ── RENDER JOURNAL DASHBOARD (Authenticated) ────────────────────
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
