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
      <div className="min-h-screen bg-app-bg flex flex-col justify-between relative overflow-hidden select-none">
        
        {/* Top background glow — restrained */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(circle_at_top,rgba(207,168,107,0.05)_0%,transparent_60%)] pointer-events-none z-0" />

        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-border bg-app-bg/85 backdrop-blur-md px-4 sm:px-8 py-3.5">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg border border-gold-border bg-gold-subtle flex items-center justify-center text-gold text-xs font-heading font-bold">
                DJ
              </div>
              <span className="font-heading font-semibold text-sm text-ink-primary tracking-tight">
                Decision <span className="text-gold font-serif italic font-normal">Journal</span>
              </span>
            </div>
            <Link href="/auth/login">
              <Button size="sm" variant="secondary" className="min-h-[44px]">Sign in</Button>
            </Link>
          </div>
        </header>

        {/* Hero Area */}
        <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-8 py-8 sm:py-16 z-10 flex flex-col gap-20 sm:gap-28 justify-center">
          
          {/* Main Hero grid layout — intentional breakpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Headline, Copy, CTAs */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-gold bg-gold-subtle border border-gold-border/40 mb-5">
                Cognitive Calibration Hub
              </span>
              
              {/* Responsive Headline (44-56px mobile, 48-60px desktop) */}
              <h1 className="font-heading text-[2.25rem] xs:text-[2.5rem] sm:text-[2.75rem] md:text-[3rem] lg:text-[3.25rem] xl:text-[3.75rem] font-bold tracking-tight text-ink-primary leading-[1.08] mb-5">
                Get better at making decisions by checking your{' '}
                <span className="text-gold font-serif italic font-normal">predictions</span> against{' '}
                <span className="text-gold font-serif italic font-normal">reality</span>.
              </h1>
              
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-xl mb-6 sm:mb-8">
                Decision Journal is a serious personal decision-intelligence tool designed to optimize judgment. 
                Commit your thoughts, assumptions, and confidence levels before reality changes what you believed.
              </p>

              {/* CTAs: Stacked on mobile, horizontal on desktop */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-8 lg:mb-0">
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full min-h-[48px]">Start your journal →</Button>
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full min-h-[48px]">Learn the loop</Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Case File Visual Mockup — Moves below CTA on mobile */}
            <div className="lg:col-span-5 w-full flex justify-center animate-scale-in">
              <div className="w-full max-w-[430px] bg-app-surface border border-border rounded-2xl p-5 sm:p-6 shadow-2xl relative">
                
                {/* Stamp */}
                <div className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-mono text-gold-dim px-2 py-0.5 border border-gold-border rounded bg-gold-subtle/20">
                  Case File #408
                </div>

                <p className="text-[10px] text-gold uppercase tracking-wider font-semibold mb-1">Business</p>
                <h3 className="font-heading text-base font-bold text-ink-primary mb-3">Hire Marketing Director</h3>

                {/* Prediction Box */}
                <div className="bg-app-input border border-border rounded-xl p-3.5 mb-4">
                  <p className="text-[9px] text-ink-muted uppercase tracking-wider mb-1 font-semibold">Commitment Prediction</p>
                  <p className="text-xs text-ink-secondary italic leading-relaxed">
                    &quot;Monthly inbound leads will increase by 25% within 90 days of onboarding.&quot;
                  </p>
                  <div className="flex justify-between text-[9px] text-ink-muted mt-2.5 pt-2.5 border-t border-border/50">
                    <span>Confidence: <strong className="text-gold">80%</strong></span>
                    <span>Review: 90 days</span>
                  </div>
                </div>

                {/* Assumptions */}
                <div className="mb-4">
                  <p className="text-[9px] text-ink-muted uppercase tracking-wider mb-2 font-semibold">Assumptions Tracked</p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { text: 'Marketing budget remains unchanged', status: 'Correct', color: 'text-signal-green' },
                      { text: 'Inbound channel is scalable', status: 'Correct', color: 'text-signal-green' },
                      { text: 'Candidate starts by Q3', status: 'Incorrect', color: 'text-signal-red' }
                    ].map((a, i) => (
                      <div key={i} className="flex justify-between text-[11px] text-ink-secondary">
                        <span className="truncate pr-2">· {a.text}</span>
                        <span className={`font-semibold shrink-0 ${a.color}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DQS Score */}
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-ink-muted uppercase tracking-wider">Scoring Index</p>
                    <p className="text-xs font-semibold text-ink-primary mt-0.5">Decision Quality (DQS)</p>
                  </div>
                  <span className="font-heading text-lg font-bold text-signal-green bg-signal-green/8 border border-signal-green/20 px-2 py-0.5 rounded-lg">
                    75%
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* How It Works Section */}
          <section id="how-it-works" className="flex flex-col gap-10 scroll-mt-20">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink-primary mb-3">
                The 5-Step Loop
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Decision quality is separate from outcome success. Our system forces you to commit to your assertions so you can learn from how you think.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { step: '01', title: 'Decide', desc: 'State the core decision context, reasoning, and alternates.' },
                { step: '02', title: 'Predict', desc: 'Formulate specific, measurable predictions. Set confidence.' },
                { step: '03', title: 'Wait', desc: 'Let time play out. Original thoughts remain visually locked.' },
                { step: '04', title: 'Review', desc: 'Evaluate reality. Test assumptions against actual facts.' },
                { step: '05', title: 'Learn', desc: 'Uncover systematic biases. Build your calibration profile.' }
              ].map((item) => (
                <div 
                  key={item.step} 
                  className="bg-app-surface border border-border rounded-2xl p-5 flex flex-col gap-2.5
                             hover:border-gold-border/50 transition-colors"
                >
                  <span className="font-heading text-xs font-bold text-gold/60">{item.step}</span>
                  <h3 className="font-heading text-sm font-bold text-ink-primary">{item.title}</h3>
                  <p className="text-[11px] text-ink-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Calibration Value Statement */}
          <section className="bg-app-surface border border-border rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="max-w-xl flex flex-col gap-2">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-ink-primary">
                Are you actually as good as you think you are?
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Calibration is the correlation of subjective confidence with objective accuracy. 
                If you are 90% sure but right only 50% of the time, you are overconfident. 
                We trace this curve over time to help you calibrate your judgment.
              </p>
            </div>
            <Link href="/auth/login" className="shrink-0 w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto min-h-[48px]">Join Decision Journal</Button>
            </Link>
          </section>

        </main>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-8 border-t border-border bg-app-surface/20 text-center text-xs text-ink-muted z-10">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Decision Journal. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/auth/login" className="hover:text-gold transition-colors">Sign In</Link>
              <span className="opacity-20">|</span>
              <a href="https://github.com/Rhytam23/decision-journal" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">GitHub Project</a>
            </div>
          </div>
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
